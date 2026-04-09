import mongoose from "mongoose";
import {
  GeneratedDocumentSchema,
  applyGeneratedDocumentBehavior,
  generatedDocumentOptions
} from "./generatedDocument.model.js";

const motivationLetterSchema = new mongoose.Schema({
  ...GeneratedDocumentSchema,
  recipientCompany: {
    type: String,
    trim: true
  }
}, generatedDocumentOptions);

motivationLetterSchema.methods.generate = function generate(payload = {}) {
  const opening = payload.openingParagraph?.trim()
    || `I am writing to express my interest${payload.position ? ` in the ${payload.position}` : ""}${payload.recipientCompany ? ` at ${payload.recipientCompany}` : ""}.`;

  const body = payload.body?.trim()
    || payload.background?.trim()
    || "My background and motivation align with the responsibilities of this opportunity.";

  const closing = payload.closingParagraph?.trim()
    || "Thank you for your consideration. I would welcome the opportunity to discuss my application.";

  this.type = "motivation_letter";
  this.format = "pdf";
  this.recipientCompany = payload.recipientCompany?.trim() || this.recipientCompany;
  this.title = payload.title?.trim() || this.title || `Motivation Letter${this.recipientCompany ? ` - ${this.recipientCompany}` : ""}`;
  this.content = [opening, body, closing, payload.signature?.trim()].filter(Boolean).join("\n\n");

  return this;
};

motivationLetterSchema.methods.adaptToJob = function adaptToJob(jobDescription) {
  if (!jobDescription?.trim()) {
    return this;
  }

  this.content = `${this.content}\n\nJob Alignment\n${jobDescription.trim()}`;
  return this;
};

applyGeneratedDocumentBehavior(motivationLetterSchema);

const MotivationLetter = mongoose.model("MotivationLetter", motivationLetterSchema);

export default MotivationLetter;
