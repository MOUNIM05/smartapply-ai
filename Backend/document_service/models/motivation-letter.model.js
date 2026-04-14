/**
 * Modele Mongoose - motivation-letter.model.js
 * Definit la structure des documents stockes dans MongoDB et leurs options.
 */
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

const ensureText = (value) => (typeof value === "string" ? value.trim() : "");
const ensureArray = (value) => (Array.isArray(value) ? value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean) : []);

motivationLetterSchema.methods.generate = function generate(payload = {}) {
  const senderName = ensureText(payload.senderName || payload.fullName || payload.signatureName);
  const senderHeadline = ensureText(payload.senderHeadline || payload.professionalTitle);
  const senderEmail = ensureText(payload.senderEmail || payload.email || payload.signatureEmail);
  const date = ensureText(payload.date) || new Date().toLocaleDateString();
  const recipientName = ensureText(payload.recipientName);
  const recipientRole = ensureText(payload.recipientRole);
  const recipientCompany = ensureText(payload.recipientCompany);
  const recipientAddress = ensureText(payload.recipientAddress);
  const greeting = ensureText(payload.greeting) || `Dear ${recipientName || "Hiring Manager"},`;
  const openingParagraph = ensureText(payload.openingParagraph)
    || `I am writing to express my interest${payload.position ? ` in the ${payload.position}` : ""}${recipientCompany ? ` at ${recipientCompany}` : ""}.`;
  const bodyParagraphs = ensureArray(payload.bodyParagraphs);
  const body = ensureText(payload.body || payload.background);
  const closingParagraph = ensureText(payload.closingParagraph)
    || "Thank you for your consideration. I would welcome the opportunity to discuss my application.";
  const signatureName = ensureText(payload.signatureName || senderName);
  const signatureEmail = ensureText(payload.signatureEmail || senderEmail);

  this.type = "motivation_letter";
  this.format = "pdf";
  this.templateKey = ensureText(payload.templateKey || payload.template) || "motivation-formal";
  this.recipientCompany = recipientCompany || this.recipientCompany;
  this.title = payload.title?.trim() || this.title || `Motivation Letter${this.recipientCompany ? ` - ${this.recipientCompany}` : ""}`;
  this.content = [
    openingParagraph,
    ...bodyParagraphs,
    body,
    closingParagraph,
    signatureName
  ].filter(Boolean).join("\n\n");
  this.structuredData = {
    senderName,
    senderHeadline,
    senderEmail,
    date,
    recipientName,
    recipientRole,
    recipientCompany,
    recipientAddress,
    greeting,
    openingParagraph,
    bodyParagraphs: bodyParagraphs.length ? bodyParagraphs : (body ? [body] : []),
    closingParagraph,
    signatureName,
    signatureEmail
  };

  return this;
};

motivationLetterSchema.methods.adaptToJob = function adaptToJob(jobDescription) {
  if (!jobDescription?.trim()) {
    return this;
  }

  this.content = `${this.content}\n\nJob Alignment\n${jobDescription.trim()}`;
  this.structuredData = {
    ...(this.structuredData || {}),
    targetJobDescription: jobDescription.trim()
  };
  return this;
};

applyGeneratedDocumentBehavior(motivationLetterSchema);

const MotivationLetter = mongoose.model("MotivationLetter", motivationLetterSchema);

export default MotivationLetter;
