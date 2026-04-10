/**
 * Couche service - cv-template.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
import CVTemplate from "../models/cv-template.model.js";

export const createCVTemplate = async (templateData) => {
  const template = new CVTemplate(templateData);
  await template.save();
  return template;
};

export const getAllCVTemplates = async () => {
  return await CVTemplate.find().sort({ name: 1 });
};

export const getCVTemplateById = async (id) => {
  return await CVTemplate.findById(id);
};

export const getFallbackCVTemplate = async () => {
  return await CVTemplate.findOne().sort({ name: 1 });
};

export const updateCVTemplate = async (id, updateData) => {
  return await CVTemplate.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteCVTemplate = async (id) => {
  return await CVTemplate.findByIdAndDelete(id);
};

