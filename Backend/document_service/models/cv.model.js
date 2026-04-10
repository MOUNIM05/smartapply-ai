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

const formatLines = (items = []) => items.filter(Boolean).join("\n");

const formatListSection = (title, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  return `${title}\n${items.filter(Boolean).map((item) => `- ${item}`).join("\n")}`;
};

const buildSectionMap = (payload = {}) => ({
  profile: formatLines([
    payload.fullName,
    payload.email,
    payload.phone,
    payload.location
  ]),
  personal: formatLines([
    payload.fullName,
    payload.email,
    payload.phone,
    payload.location
  ]),
  summary: payload.summary ? `Professional Summary\n${payload.summary}` : "",
  experience: formatListSection("Experience", payload.experience),
  education: formatListSection("Education", payload.education),
  skills: formatListSection("Skills", payload.skills),
  projects: formatListSection("Projects", payload.projects),
  portfolio: formatListSection("Portfolio", payload.portfolio)
});

cvSchema.methods.generate = function generate(payload = {}, template = null) {
  const identityBlock = formatLines([
    payload.fullName,
    payload.email,
    payload.phone,
    payload.location
  ]);
  const sectionMap = buildSectionMap(payload);
  const requestedSections = Array.isArray(template?.layoutOptions?.sections)
    ? Array.from(new Set(template.layoutOptions.sections))
    : [];
  const orderedSections = requestedSections
    .map((sectionName) => sectionMap[sectionName])
    .filter(Boolean);
  const fallbackSectionOrder = ["profile", "summary", "skills", "experience", "education", "projects", "portfolio"];
  const remainingSections = fallbackSectionOrder
    .filter((sectionName) => !requestedSections.includes(sectionName))
    .map((sectionName) => sectionMap[sectionName])
    .filter(Boolean);
  const sections = [
    ...orderedSections,
    ...remainingSections
  ].filter(Boolean);

  this.type = "cv";
  this.format = "pdf";
  this.targetPosition = payload.targetPosition?.trim() || this.targetPosition;
  this.templateRef = template?.id || template?._id || this.templateRef;
  this.title = payload.title?.trim() || this.title || `CV${this.targetPosition ? ` - ${this.targetPosition}` : ""}`;
  this.content = sections.length > 0 ? sections.join("\n\n") : identityBlock;

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
  return this;
};

applyGeneratedDocumentBehavior(cvSchema);

const CV = mongoose.model("CV", cvSchema);

export default CV;

