// Registers Document.routes routes for the document service.
import express from "express";
import { createCVController, getCVsController, exportCVPDFController } from "../controllers/cv.controller.js";
import { createMotivationLetterController, exportMotivationLetterPDFController } from "../controllers/motivation-letter.controller.js";
import { createApplicationEmailController, exportEmailPDFController } from "../controllers/application-email.controller.js";
import { getCVTemplatesController } from "../controllers/cv-template.controller.js";

const router = express.Router();

// CV routes
router.post("/api/documents/cv", createCVController);
router.get("/api/documents/cv/:id/pdf", exportCVPDFController);

// Motivation letter routes
router.post("/api/documents/motivation-letter", createMotivationLetterController);
router.get("/api/documents/motivation-letter/:id/pdf", exportMotivationLetterPDFController);

// Application email routes
router.post("/api/documents/email", createApplicationEmailController);
router.get("/api/documents/email/:id/pdf", exportEmailPDFController);

// List generated CV documents
router.get("/api/documents", getCVsController);

// Get templates
router.get("/api/templates", getCVTemplatesController);

export default router;
