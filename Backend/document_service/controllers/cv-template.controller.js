/**
 * Controleur HTTP - cv-template.controller.js
 * Recoit les requetes Express, appelle la couche service et renvoie les reponses JSON.
 */
import { getAllCVTemplates } from "../services/cv-template.service.js";

export const getCVTemplatesController = async (req, res, next) => {
  try {
    const templates = await getAllCVTemplates();
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    next(error);
  }
};
