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

const ensureText = (value) => (typeof value === "string" ? value.trim() : "");
const ensureArray = (value) => (Array.isArray(value) ? value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean) : []);

applicationEmailSchema.methods.generate = function generate(payload = {}) {
  const greeting = ensureText(payload.greeting) || `Dear ${payload.recipientName || "Hiring Team"},`;
  const intro = ensureText(payload.intro)
    || `I am reaching out regarding${payload.position ? ` the ${payload.position} position` : " your opportunity"}.`;
  const bodyParagraphs = ensureArray(payload.bodyParagraphs);
  const body = ensureText(payload.body)
    || "I believe my profile matches the role well and I would be glad to share more details about my experience.";
  const callToAction = ensureText(payload.callToAction)
    || "Please let me know if you would like to review my attached CV and discuss my profile further.";
  const closing = ensureText(payload.closing) || "Best regards,";
  const signatureName = ensureText(payload.signatureName || payload.fullName);
  const signatureTitle = ensureText(payload.signatureTitle || payload.professionalTitle);
  const signatureEmail = ensureText(payload.signatureEmail || payload.email);

  this.type = "application_email";
  this.format = "pdf";
  this.templateKey = ensureText(payload.templateKey || payload.template) || "email-prime";
  this.subject = payload.subject?.trim() || this.subject;
  this.title = payload.title?.trim() || this.title || this.subject || "Application Email";
  this.content = [greeting, intro, ...bodyParagraphs, body, callToAction, closing, signatureName].filter(Boolean).join("\n\n");
  this.structuredData = {
    senderName: signatureName,
    senderTitle: signatureTitle,
    senderEmail: signatureEmail,
    recipientName: ensureText(payload.recipientName),
    subject: this.subject,
    greeting,
    intro,
    bodyParagraphs: bodyParagraphs.length ? bodyParagraphs : (body ? [body] : []),
    callToAction,
    closing,
    signatureName,
    signatureTitle,
    signatureEmail
  };

  return this;
};

applyGeneratedDocumentBehavior(applicationEmailSchema);

const ApplicationEmail = mongoose.model("ApplicationEmail", applicationEmailSchema);

export default ApplicationEmail;
