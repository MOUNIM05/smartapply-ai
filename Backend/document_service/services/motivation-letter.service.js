/**
 * Couche service - motivation-letter.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
import MotivationLetter from "../models/motivation-letter.model.js";
import { resolveNotificationUserId, sendNotification } from "./notification-client.service.js";

export const createMotivationLetter = async (letterData) => {
  const letter = new MotivationLetter();
  letter.generate(letterData);
  letter.ownerUserId = resolveNotificationUserId(letterData);

  if (letterData.jobDescription) {
    letter.adaptToJob(letterData.jobDescription);
  }

  await letter.save();

  await sendNotification({
    userId: letter.ownerUserId,
    title: "Lettre de motivation generee",
    message: `Votre document ${letter.title} a ete genere.`,
    type: "system",
    event: "document_motivation_letter_created",
    sourceService: "document-service",
    metadata: {
      documentId: String(letter.id),
      documentType: letter.type
    }
  });

  return letter;
};

export const getAllMotivationLetters = async () => {
  return await MotivationLetter.find().sort({ createdAt: -1 });
};

export const getMotivationLetterById = async (id) => {
  return await MotivationLetter.findById(id);
};

export const updateMotivationLetter = async (id, updateData) => {
  return await MotivationLetter.findByIdAndUpdate(id, { ...updateData, updatedAt: Date.now() }, { new: true });
};

export const deleteMotivationLetter = async (id) => {
  return await MotivationLetter.findByIdAndDelete(id);
};

