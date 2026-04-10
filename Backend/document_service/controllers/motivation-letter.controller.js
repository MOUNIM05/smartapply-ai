/**
 * Controleur HTTP - motivation-letter.controller.js
 * Recoit les requetes Express, appelle la couche service et renvoie les reponses JSON.
 */
import { createMotivationLetter, getMotivationLetterById } from "../services/motivation-letter.service.js";
import { streamPDFToResponse } from "../services/pdf.service.js";

export const createMotivationLetterController = async (req, res, next) => {
  try {
    const letter = await createMotivationLetter(req.body);
    res.setHeader("X-Document-Id", letter.id);
    streamPDFToResponse(letter.exportPDF(), res, `MotivationLetter_${letter.id}`, 201);
  } catch (error) {
    next(error);
  }
};

export const exportMotivationLetterPDFController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const letter = await getMotivationLetterById(id);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Motivation letter not found"
      });
    }
    streamPDFToResponse(letter.exportPDF(), res, `MotivationLetter_${letter.id}`);
  } catch (error) {
    next(error);
  }
};

