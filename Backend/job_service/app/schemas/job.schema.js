/**
 * Schema de validation - job.schema.js
 * Decrit et valide les donnees recues avant leur traitement par les services.
 */
const validateCreateJobOfferRequest = (payload) => {
  const jobTitle = payload?.jobTitle?.trim();
  const company = payload?.company?.trim();
  const description = payload?.description?.trim() || "";
  const location = payload?.location?.trim() || "";
  const employmentType = payload?.employmentType?.trim() || "";

  if (!jobTitle || !company) {
    const error = new Error("Job title and company are required");
    error.statusCode = 422;
    throw error;
  }

  return {
    jobTitle,
    company,
    description,
    location,
    employmentType
  };
};

const validateCreateApplicationRequest = (payload) => {
  const profileId = payload?.profileId;
  const jobOfferId = payload?.jobOfferId;
  const status = payload?.status?.trim() || "draft";
  const cvFile = payload?.cvFile || null;
  const motivationLetterFile = payload?.motivationLetterFile || null;

  if (!profileId || !jobOfferId) {
    const error = new Error("profileId and jobOfferId are required");
    error.statusCode = 422;
    throw error;
  }

  if (!["draft", "submitted", "reviewed", "accepted", "rejected"].includes(status)) {
    const error = new Error("Invalid application status");
    error.statusCode = 422;
    throw error;
  }

  const normalizePdfFile = (file, label) => {
    if (!file) return null;

    const fileName = file.fileName?.trim?.();
    const mimeType = file.mimeType?.trim?.();
    const dataUrl = file.dataUrl?.trim?.();
    const size = Number(file.size);

    if (!fileName || !mimeType || !dataUrl || !Number.isFinite(size) || size <= 0) {
      const error = new Error(`${label} is invalid`);
      error.statusCode = 422;
      throw error;
    }

    if (mimeType !== "application/pdf") {
      const error = new Error(`${label} must be a PDF file`);
      error.statusCode = 422;
      throw error;
    }

    if (!dataUrl.startsWith("data:application/pdf;base64,")) {
      const error = new Error(`${label} must be encoded as a PDF data URL`);
      error.statusCode = 422;
      throw error;
    }

    if (size > 5 * 1024 * 1024) {
      const error = new Error(`${label} must be smaller than 5 MB`);
      error.statusCode = 422;
      throw error;
    }

    return {
      fileName,
      mimeType,
      size,
      dataUrl
    };
  };

  const normalizedCvFile = normalizePdfFile(cvFile, "CV");
  const normalizedMotivationLetterFile = normalizePdfFile(motivationLetterFile, "Motivation letter");

  if (status === "submitted" && (!normalizedCvFile || !normalizedMotivationLetterFile)) {
    const error = new Error("CV and motivation letter PDF files are required to submit an application");
    error.statusCode = 422;
    throw error;
  }

  return {
    profileId,
    jobOfferId,
    status,
    cvFile: normalizedCvFile,
    motivationLetterFile: normalizedMotivationLetterFile
  };
};

module.exports = {
  validateCreateJobOfferRequest,
  validateCreateApplicationRequest
};

