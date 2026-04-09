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