/**
 * Couche service - application-email.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
import ApplicationEmail from "../models/application-email.model.js";
import { resolveNotificationUserId, sendNotification } from "./notification-client.service.js";

export const createApplicationEmail = async (emailData) => {
  const email = new ApplicationEmail();
  email.generate(emailData);
  email.ownerUserId = resolveNotificationUserId(emailData);
  await email.save();

  await sendNotification({
    userId: email.ownerUserId,
    title: "Email de candidature genere",
    message: `Votre document ${email.title} a ete genere.`,
    type: "system",
    event: "document_application_email_created",
    sourceService: "document-service",
    metadata: {
      documentId: String(email.id),
      documentType: email.type
    }
  });

  return email;
};

export const getAllApplicationEmails = async () => {
  return await ApplicationEmail.find().sort({ createdAt: -1 });
};

export const getApplicationEmailById = async (id) => {
  return await ApplicationEmail.findById(id);
};

export const updateApplicationEmail = async (id, updateData) => {
  return await ApplicationEmail.findByIdAndUpdate(id, { ...updateData, updatedAt: Date.now() }, { new: true });
};

export const deleteApplicationEmail = async (id) => {
  return await ApplicationEmail.findByIdAndDelete(id);
};

