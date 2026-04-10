/**
 * Couche service - application-email.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
import ApplicationEmail from "../models/application-email.model.js";

export const createApplicationEmail = async (emailData) => {
  const email = new ApplicationEmail();
  email.generate(emailData);
  await email.save();
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

