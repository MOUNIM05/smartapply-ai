/**
 * Couche service - job.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { Application } = require("../models/application.model");
const { JobOffer } = require("../models/job-offer.model");
const { sendNotification } = require("./notification-client.service");

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

const listJobOffers = async () => {
  const jobOffers = await JobOffer.find().sort({ createdAt: -1 });

  return {
    jobOffers: jobOffers.map(serializeJobOffer)
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

