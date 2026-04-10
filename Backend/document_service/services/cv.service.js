/**
 * Couche service - cv.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
import CV from "../models/cv.model.js";
import { getCVTemplateById, getFallbackCVTemplate } from "./cv-template.service.js";

export const createCV = async (cvData) => {
  const cv = new CV();
  const selectedTemplate = cvData.templateId
    ? await getCVTemplateById(cvData.templateId)
    : await getFallbackCVTemplate();

  cv.generate(cvData, selectedTemplate);

  if (cvData.jobDescription) {
    cv.adaptToJob(cvData.jobDescription);
  }

  await cv.save();
  return cv;
};

export const getAllCVs = async () => {
  return await CV.find().sort({ createdAt: -1 });
};

export const getCVById = async (id) => {
  return await CV.findById(id);
};

export const updateCV = async (id, updateData) => {
  return await CV.findByIdAndUpdate(id, { ...updateData, updatedAt: Date.now() }, { new: true });
};

export const deleteCV = async (id) => {
  return await CV.findByIdAndDelete(id);
};

