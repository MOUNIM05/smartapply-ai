/**
 * Schema de validation - ai.schema.js
 * Decrit et valide les donnees recues avant leur traitement par les services.
 */
const ensureObjectId = (value, fieldName) => {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 422;
    throw error;
  }

  return value.trim();
};

const ensureText = (value, fieldName) => {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 422;
    throw error;
  }

  return value.trim();
};

const validateCreateAIModelRequest = (payload) => ({
  name: ensureText(payload.name, "name"),
  provider: ensureText(payload.provider, "provider"),
  version: ensureText(payload.version, "version"),
  isActive: typeof payload.isActive === "boolean" ? payload.isActive : true
});

const validateCreateAIGenerationRequest = (payload) => {
  const allowedTypes = [
    "cv_generation",
    "motivation_letter",
    "application_email",
    "job_adaptation",
    "other"
  ];

  const requestType = ensureText(payload.requestType, "requestType");

  if (!allowedTypes.includes(requestType)) {
    const error = new Error("requestType is invalid");
    error.statusCode = 422;
    throw error;
  }

  return {
    aiModelId: payload.aiModelId ? ensureObjectId(payload.aiModelId, "aiModelId") : null,
    prompt: ensureText(payload.prompt, "prompt"),
    contextData:
      payload.contextData && typeof payload.contextData === "object" ? payload.contextData : {},
    requestType
  };
};

const validateCreateAIGenerationResponseRequest = (payload) => {
  const allowedStatuses = ["pending", "completed", "failed"];
  const status = payload.status ? ensureText(payload.status, "status") : "completed";

  if (!allowedStatuses.includes(status)) {
    const error = new Error("status is invalid");
    error.statusCode = 422;
    throw error;
  }

  return {
    requestId: ensureObjectId(payload.requestId, "requestId"),
    rawOutput: ensureText(payload.rawOutput, "rawOutput"),
    structuredOutput:
      payload.structuredOutput && typeof payload.structuredOutput === "object"
        ? payload.structuredOutput
        : {},
    status
  };
};

const validateParseCVUploadRequest = (payload) => {
  const fileName = ensureText(payload?.fileName, "fileName");
  const mimeType = ensureText(payload?.mimeType, "mimeType").toLowerCase();
  const rawContent = ensureText(payload?.contentBase64, "contentBase64");
  const normalizedContent = rawContent.includes(",")
    ? rawContent.split(",").pop().trim()
    : rawContent.trim();

  if (!normalizedContent) {
    const error = new Error("contentBase64 is required");
    error.statusCode = 422;
    throw error;
  }

  return {
    fileName,
    mimeType,
    contentBase64: normalizedContent
  };
};

module.exports = {
  validateCreateAIModelRequest,
  validateCreateAIGenerationRequest,
  validateCreateAIGenerationResponseRequest,
  validateParseCVUploadRequest
};

