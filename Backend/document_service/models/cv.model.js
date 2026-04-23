/**
 * Modele Mongoose - cv.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
import mongoose from "mongoose";
import {
  GeneratedDocumentSchema,
  applyGeneratedDocumentBehavior,
  generatedDocumentOptions
} from "./generatedDocument.model.js";

const cvSchema = new mongoose.Schema({
  ...GeneratedDocumentSchema,
  targetPosition: {
    type: String,
    trim: true
  },
  templateRef: {
    type: String,
    ref: "CVTemplate",
    select: false
  }
}, generatedDocumentOptions);

const ensureArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const ensureText = (value) => (typeof value === "string" ? value.trim() : "");
const defaultLayoutByTemplateKey = {
  "cv-modern-sidebar": {
    accentColor: "#cfe0f5",
    sections: ["summary", "experience", "education", "skills", "languages"]
  },
  "cv-simple-sidebar": {
    accentColor: "#1f2937",
    sections: ["summary", "experience", "education", "skills", "languages", "hobbies"]
  },
  "cv-classic-balance": {
    accentColor: "#5b6870",
    sections: ["summary", "skills", "awards", "education", "experience", "hobbies"]
  }
};

const normalizeListEntries = (value) =>
  ensureArray(value).map((item) => {
    if (typeof item === "string") {
      return {
        title: item.trim()
      };
    }

    if (item && typeof item === "object") {
      return {
        title: ensureText(item.title || item.jobTitle || item.degree || item.name || item.label),
        subtitle: ensureText(item.company || item.school || item.institution || item.level),
        dateRange: ensureText(item.dateRange || [item.startDate, item.endDate].filter(Boolean).join(" - ")),
        bullets: ensureArray(item.bullets || item.highlights || item.items || item.details)
      };
    }

    return null;
  }).filter((item) => item && item.title);

const formatEntry = (entry) => {
  const header = [entry.dateRange, [entry.title, entry.subtitle].filter(Boolean).join(" - ")].filter(Boolean).join(" | ");
  const bullets = ensureArray(entry.bullets).map((bullet) => `- ${bullet}`).join("\n");
  return [header, bullets].filter(Boolean).join("\n");
};

cvSchema.methods.generate = function generate(payload = {}, template = null) {
  const fullName = ensureText(payload.fullName);
  const email = ensureText(payload.email);
  const phone = ensureText(payload.phone);
  const address = ensureText(payload.location || payload.address);
  const headline = ensureText(payload.headline || payload.professionalTitle || payload.targetPosition);
  const summary = ensureText(payload.summary);
  const skills = ensureArray(payload.skills);
  const languages = ensureArray(payload.languages);
  const hobbies = ensureArray(payload.hobbies);
  const experience = normalizeListEntries(payload.experience);
  const education = normalizeListEntries(payload.education);
  const projects = normalizeListEntries(payload.projects);
  const templateKey = ensureText(payload.templateKey || payload.template || template?.style) || "cv-modern-sidebar";
  const fallbackLayout = defaultLayoutByTemplateKey[templateKey] || defaultLayoutByTemplateKey["cv-modern-sidebar"];
  const orderedSections = [
    summary ? `Profile\n${summary}` : "",
    skills.length ? `Skills\n${skills.map((item) => `- ${item}`).join("\n")}` : "",
    experience.length ? `Experience\n${experience.map(formatEntry).join("\n\n")}` : "",
    education.length ? `Education\n${education.map(formatEntry).join("\n\n")}` : "",
    languages.length ? `Languages\n${languages.map((item) => `- ${item}`).join("\n")}` : "",
    projects.length ? `Projects\n${projects.map(formatEntry).join("\n\n")}` : "",
    hobbies.length ? `Hobbies\n${hobbies.map((item) => `- ${item}`).join("\n")}` : ""
  ].filter(Boolean);

  this.type = "cv";
  this.format = "pdf";
  this.templateKey = templateKey;
  this.targetPosition = ensureText(payload.targetPosition) || this.targetPosition;
  this.templateRef = template?.id || template?._id || this.templateRef;
  this.title = payload.title?.trim() || this.title || `CV${this.targetPosition ? ` - ${this.targetPosition}` : ""}`;
  this.content = orderedSections.join("\n\n") || [fullName, headline, summary].filter(Boolean).join("\n");
  this.structuredData = {
    fullName,
    headline,
    email,
    phone,
    address,
    summary,
    skills,
    languages,
    hobbies,
    experience,
    education,
    projects,
    accentColor: template?.layoutOptions?.accentColor || fallbackLayout.accentColor,
    sections: template?.layoutOptions?.sections || fallbackLayout.sections
  };

  if (!this.content) {
    this.content = "Professional profile not provided.";
  }

  return this;
};

cvSchema.methods.adaptToJob = function adaptToJob(jobDescription) {
  if (!jobDescription?.trim()) {
    return this;
  }

  this.content = `${this.content}\n\nJob Adaptation\n- Tailored for: ${jobDescription.trim()}`;
  this.structuredData = {
    ...(this.structuredData || {}),
    targetJobDescription: jobDescription.trim()
  };
  return this;
};

applyGeneratedDocumentBehavior(cvSchema);

const CV = mongoose.model("CV", cvSchema);

export default CV;
