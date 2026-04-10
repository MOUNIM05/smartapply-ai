/**
 * Controleur HTTP - cv.controller.js
 * Recoit les requetes Express, appelle la couche service et renvoie les reponses JSON.
 */
import { createCV, getAllCVs, getCVById } from "../services/cv.service.js";
import { streamPDFToResponse } from "../services/pdf.service.js";

export const createCVController = async (req, res, next) => {
  try {
    const cv = await createCV(req.body);
    res.setHeader("X-Document-Id", cv.id);
    streamPDFToResponse(cv.exportPDF(), res, `CV_${cv.id}`, 201);
  } catch (error) {
    next(error);
  }
};

export const getCVsController = async (req, res, next) => {
  try {
    const cvs = await getAllCVs();
    res.status(200).json({
      success: true,
      data: cvs
    });
  } catch (error) {
    next(error);
  }
};

export const exportCVPDFController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cv = await getCVById(id);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found"
      });
    }
    streamPDFToResponse(cv.exportPDF(), res, `CV_${cv.id}`);
  } catch (error) {
    next(error);
  }
};

