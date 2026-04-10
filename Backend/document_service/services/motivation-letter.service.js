/**
 * Couche service - motivation-letter.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
import MotivationLetter from "../models/motivation-letter.model.js";

export const createMotivationLetter = async (letterData) => {
  const letter = new MotivationLetter();
  letter.generate(letterData);

  if (letterData.jobDescription) {
    letter.adaptToJob(letterData.jobDescription);
  }

  await letter.save();
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

