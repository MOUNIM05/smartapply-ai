/**
 * Couche service - job.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Application } = require("../models/application.model");
const { JobOffer } = require("../models/job-offer.model");
const { sendNotification } = require("./notification-client.service");
const PROFILE_SERVICE_URL = process.env.PROFILE_SERVICE_URL || "http://localhost:5001";
const PROFILE_TIMEOUT_MS = Number(process.env.PROFILE_TIMEOUT_MS || 3000);
const PROFILE_STOP_WORDS = new Set([
  "with",
  "that",
  "from",
  "this",
  "your",
  "pour",
  "dans",
  "avec",
  "chez",
  "vous",
  "nous",
  "their",
  "full",
  "time",
  "stage",
  "emploi",
  "poste",
  "job",
  "role",
  "company",
  "remote",
  "hybrid"
]);
const INTEREST_KEYWORDS = {
  dev: [
    "developer",
    "develop",
    "software",
    "frontend",
    "backend",
    "fullstack",
    "react",
    "node",
    "javascript",
    "typescript",
    "api",
    "engineer"
  ],
  data: [
    "data",
    "analyst",
    "analytics",
    "bi",
    "machine",
    "learning",
    "sql",
    "python",
    "etl",
    "dashboard"
  ],
  design: [
    "design",
    "ui",
    "ux",
    "figma",
    "prototype",
    "wireframe",
    "visual",
    "brand"
  ],
  marketing: [
    "marketing",
    "seo",
    "content",
    "social",
    "campaign",
    "growth",
    "brand",
    "ads"
  ],
  product: [
    "product",
    "roadmap",
    "stakeholder",
    "discovery",
    "kpi",
    "feature",
    "user story"
  ],
  qa: [
    "qa",
    "test",
    "testing",
    "automation",
    "selenium",
    "cypress",
    "quality",
    "bug"
  ]
};

const serializeStoredFile = (file) =>
  file
    ? {
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size
      }
    : null;

const serializeJobOffer = (jobOffer) => ({
  id: jobOffer._id,
  jobTitle: jobOffer.jobTitle,
  company: jobOffer.company,
  description: jobOffer.description,
  location: jobOffer.location,
  employmentType: jobOffer.employmentType,
  addedAt: jobOffer.addedAt,
  createdAt: jobOffer.createdAt,
  updatedAt: jobOffer.updatedAt
});

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const tokenize = (value) =>
  normalizeText(value)
    .split(/[^a-zA-Z0-9+#.]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2 && !PROFILE_STOP_WORDS.has(item));

const clampScore = (value) => Math.max(18, Math.min(Math.round(value), 98));

const buildProfileContext = ({ profile, skills }) => {
  const profileTitle = String(profile?.professional_title || "").trim();
  const summary = String(profile?.summary || "").trim();
  const address = String(profile?.address || "").trim();
  const skillNames = Array.isArray(skills)
    ? skills.map((item) => String(item?.name || "").trim()).filter(Boolean)
    : [];

  const profileTokens = new Set(
    tokenize([profileTitle, summary, address, skillNames.join(" ")].join(" "))
  );

  return {
    profileTitle,
    summary,
    address,
    skillNames,
    profileTokens
  };
};

const fetchUserProfileContext = async (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROFILE_TIMEOUT_MS);

  try {
    const requestJson = async (url) => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authorizationHeader
        },
        signal: controller.signal
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    };

    const [profilePayload, skillsPayload] = await Promise.all([
      requestJson(`${PROFILE_SERVICE_URL}/profiles/me`),
      requestJson(`${PROFILE_SERVICE_URL}/skills/me`)
    ]);

    return buildProfileContext({
      profile: profilePayload?.profile || null,
      skills: skillsPayload?.skills || []
    });
  } catch (error) {
    console.error("Unable to load profile context in job service:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const buildRecommendation = (jobOffer, profileContext, options = {}) => {
  const selectedInterests = Array.isArray(options.interests)
    ? options.interests
        .map((item) => String(item || "").trim().toLowerCase())
        .filter(Boolean)
    : [];

  if (!profileContext) {
    const interestHints = selectedInterests.length
      ? selectedInterests
      : [];

    return {
      score: 40,
      matchedSkills: [],
      matchedKeywords: [],
      matchedInterests: interestHints,
      reasons: [
        "Complete your profile details to unlock stronger personalized suggestions."
      ]
    };
  }

  const jobText = [
    jobOffer.jobTitle,
    jobOffer.company,
    jobOffer.description,
    jobOffer.location,
    jobOffer.employmentType
  ].join(" ");
  const normalizedJobText = normalizeText(jobText);
  const jobTokens = new Set(tokenize(jobText));

  const matchedSkills = profileContext.skillNames.filter((skill) =>
    normalizedJobText.includes(normalizeText(skill))
  );
  const matchedKeywords = [...profileContext.profileTokens].filter((token) =>
    jobTokens.has(token)
  );
  const matchedInterests = selectedInterests.filter((interest) => {
    const keywords = INTEREST_KEYWORDS[interest] || [interest];
    return keywords.some((keyword) => normalizedJobText.includes(normalizeText(keyword)));
  });

  let score = 26;
  score += matchedSkills.length * 10;
  score += matchedKeywords.length * 6;
  score += matchedInterests.length * 12;

  const titleMatch =
    profileContext.profileTitle &&
    normalizeText(jobOffer.jobTitle).includes(normalizeText(profileContext.profileTitle));
  if (titleMatch) {
    score += 20;
  }

  const locationMatch =
    profileContext.address &&
    jobOffer.location &&
    (normalizeText(profileContext.address).includes(normalizeText(jobOffer.location)) ||
      normalizeText(jobOffer.location).includes(normalizeText(profileContext.address)));
  if (locationMatch) {
    score += 10;
  }

  if (profileContext.summary) {
    score += 6;
  }

  const reasons = [];
  if (titleMatch) reasons.push("Job title matches your profile title.");
  if (locationMatch) reasons.push("Location aligns with your profile address.");
  if (matchedSkills.length) reasons.push(`Matched skills: ${matchedSkills.slice(0, 4).join(", ")}.`);
  if (matchedInterests.length) reasons.push(`Interest match: ${matchedInterests.join(", ")}.`);
  if (!reasons.length) reasons.push("Suggestion based on keywords from your profile summary and skills.");

  return {
    score: clampScore(score),
    matchedSkills: matchedSkills.slice(0, 8),
    matchedKeywords: matchedKeywords.slice(0, 8),
    matchedInterests: matchedInterests.slice(0, 6),
    reasons
  };
};

const serializeApplication = (application) => ({
  id: application._id,
  profileId: application.profileId,
  jobOfferId: application.jobOfferId,
  appliedAt: application.appliedAt,
  status: application.status,
  cvFile: serializeStoredFile(application.cvFile),
  motivationLetterFile: serializeStoredFile(application.motivationLetterFile),
  createdAt: application.createdAt,
  updatedAt: application.updatedAt
});

const createJobOffer = async (actorUserId, payload) => {
  const jobOffer = await JobOffer.create(payload);

  await sendNotification({
    userId: String(actorUserId),
    title: "Offre d'emploi creee",
    message: `L'offre ${jobOffer.jobTitle} chez ${jobOffer.company} a ete creee.`,
    type: "job_offer",
    event: "job_offer_created",
    sourceService: "job-service",
    metadata: {
      jobOfferId: String(jobOffer._id),
      company: jobOffer.company,
      jobTitle: jobOffer.jobTitle
    }
  });

  return {
    message: "Job offer created successfully",
    jobOffer: serializeJobOffer(jobOffer)
  };
};

const listJobOffers = async (user, authorizationHeader, options = {}) => {
  const jobOffers = await JobOffer.find().sort({ createdAt: -1 });
  let serialized = jobOffers.map(serializeJobOffer);

  if (user?.role !== "admin") {
    const profileContext = await fetchUserProfileContext(authorizationHeader);
    serialized = serialized.map((jobOffer) => ({
      ...jobOffer,
      recommendation: buildRecommendation(jobOffer, profileContext, options)
    }));

    if (options.recommended) {
      serialized.sort((a, b) => {
        const scoreDiff = (b.recommendation?.score || 0) - (a.recommendation?.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return Number(new Date(b.createdAt)) - Number(new Date(a.createdAt));
      });
    }
  }

  if (options.limit) {
    serialized = serialized.slice(0, options.limit);
  }

  return {
    jobOffers: serialized
  };
};

const getJobOfferById = async (jobOfferId) => {
  const jobOffer = await JobOffer.findById(jobOfferId);

  if (!jobOffer) {
    const error = new Error("Job offer not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    jobOffer: serializeJobOffer(jobOffer)
  };
};

const createApplication = async (actorUserId, { profileId, jobOfferId, status, cvFile, motivationLetterFile }) => {
  const jobOffer = await JobOffer.findById(jobOfferId);

  if (!jobOffer) {
    const error = new Error("Job offer not found");
    error.statusCode = 404;
    throw error;
  }

  const application = await Application.create({
    profileId,
    jobOfferId,
    status,
    cvFile,
    motivationLetterFile
  });

  await sendNotification({
    userId: actorUserId,
    title: "Candidature envoyee",
    message: `Votre candidature pour ${jobOffer.jobTitle} chez ${jobOffer.company} a ete enregistree.`,
    type: "job_application",
    event: "application_created",
    sourceService: "job-service",
    metadata: {
      applicationId: String(application._id),
      profileId: String(profileId),
      jobOfferId: String(jobOfferId),
      status: application.status,
      hasCv: Boolean(cvFile),
      hasMotivationLetter: Boolean(motivationLetterFile),
      cvFileName: cvFile?.fileName || null,
      motivationLetterFileName: motivationLetterFile?.fileName || null,
      jobTitle: jobOffer.jobTitle,
      company: jobOffer.company
    }
  });

  return {
    message: "Application created successfully",
    application: serializeApplication(application)
  };
};

const listApplications = async () => {
  const applications = await Application.find().sort({ createdAt: -1 });

  return {
    applications: applications.map(serializeApplication)
  };
};

const getApplicationById = async (applicationId) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    application: serializeApplication(application)
  };
};

module.exports = {
  createJobOffer,
  listJobOffers,
  getJobOfferById,
  createApplication,
  listApplications,
  getApplicationById
};

