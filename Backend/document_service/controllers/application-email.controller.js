/**
 * Controleur HTTP - application-email.controller.js
 * Recoit les requetes Express, appelle la couche service et renvoie les reponses JSON.
 */
import { createApplicationEmail, getApplicationEmailById } from "../services/application-email.service.js";
import { streamPDFToResponse } from "../services/pdf.service.js";
import { sendNotification } from "../services/notification-client.service.js";

export const createApplicationEmailController = async (req, res, next) => {
  try {
    const email = await createApplicationEmail(req.body);
    res.setHeader("X-Document-Id", email.id);
    streamPDFToResponse(email.exportPDF(), res, `ApplicationEmail_${email.id}`, 201);
  } catch (error) {
    next(error);
  }
};

export const exportEmailPDFController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const email = await getApplicationEmailById(id);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Application email not found"
      });
    }

    await sendNotification({
      userId: email.ownerUserId,
      title: "Email de candidature exporte",
      message: `Le document ${email.title} a ete exporte en PDF.`,
      type: "system",
      event: "document_application_email_exported",
      sourceService: "document-service",
      metadata: {
        documentId: String(email.id),
        documentType: email.type
      }
    });

    streamPDFToResponse(email.exportPDF(), res, `ApplicationEmail_${email.id}`);
  } catch (error) {
    next(error);
  }
};

