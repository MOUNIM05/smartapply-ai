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

module.exports = {
  validateCreateAIModelRequest,
  validateCreateAIGenerationRequest,
  validateCreateAIGenerationResponseRequest
};

