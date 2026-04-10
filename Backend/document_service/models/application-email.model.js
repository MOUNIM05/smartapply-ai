/**
 * Modele Mongoose - application-email.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
import mongoose from "mongoose";
import {
  GeneratedDocumentSchema,
  applyGeneratedDocumentBehavior,
  generatedDocumentOptions
} from "./generatedDocument.model.js";

const applicationEmailSchema = new mongoose.Schema({
  ...GeneratedDocumentSchema,
  subject: {
    type: String,
    required: true,
    trim: true
  }
}, generatedDocumentOptions);

applicationEmailSchema.methods.generate = function generate(payload = {}) {
  const greeting = payload.greeting?.trim() || "Hello,";
  const intro = payload.intro?.trim()
    || `I am reaching out regarding${payload.position ? ` the ${payload.position} position` : " your opportunity"}.`;
  const body = payload.body?.trim()
    || "I believe my profile matches the role well and I would be glad to share more details about my experience.";
  const closing = payload.closing?.trim()
    || "Thank you for your time and consideration.";

  this.type = "application_email";
  this.format = "pdf";
  this.subject = payload.subject?.trim() || this.subject;
  this.title = payload.title?.trim() || this.title || this.subject || "Application Email";
  this.content = [greeting, intro, body, closing, payload.signature?.trim()].filter(Boolean).join("\n\n");

  return this;
};

applyGeneratedDocumentBehavior(applicationEmailSchema);

const ApplicationEmail = mongoose.model("ApplicationEmail", applicationEmailSchema);

export default ApplicationEmail;

