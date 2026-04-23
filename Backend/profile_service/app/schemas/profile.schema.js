/**
 * Schema de validation - profile.schema.js
 * Decrit et valide les donnees recues avant leur traitement par les services.
 */
const validateCreateProfileRequest = (payload) => {
  const professional_title = payload?.professional_title?.trim();
  const summary = payload?.summary?.trim() || "";
  const phone = payload?.phone?.trim() || "";
  const address = payload?.address?.trim() || "";
  const linkedin_url = payload?.linkedin_url?.trim() || "";
  const github_url = payload?.github_url?.trim() || "";
  const portfolio_url = payload?.portfolio_url?.trim() || "";

  if (!professional_title) {
    const error = new Error("Professional title is required");
    error.statusCode = 422;
    throw error;
  }

  return {
    professional_title,
    summary,
    phone,
    address,
    linkedin_url,
    github_url,
    portfolio_url
  };
};

const SUPPORTED_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown"
]);
const MAX_CV_UPLOAD_BYTES = 5 * 1024 * 1024;

const estimateBase64Size = (base64Content) => {
  const normalized = String(base64Content || "").replace(/\s+/g, "");
  if (!normalized) return 0;
  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
};

const validateUpsertProfileCVRequest = (payload) => {
  const fileName = payload?.fileName?.trim();
  const mimeType = payload?.mimeType?.trim().toLowerCase();
  const rawContent = payload?.contentBase64?.trim();
  const normalizedContent = rawContent?.includes(",")
    ? rawContent.split(",").pop().trim()
    : rawContent;
  const payloadSize =
    Number.isFinite(Number(payload?.size)) && Number(payload?.size) > 0
      ? Number(payload.size)
      : 0;
  const inferredSize = estimateBase64Size(normalizedContent || "");
  const size = payloadSize || inferredSize;

  if (!fileName) {
    const error = new Error("fileName is required");
    error.statusCode = 422;
    throw error;
  }

  if (!mimeType) {
    const error = new Error("mimeType is required");
    error.statusCode = 422;
    throw error;
  }

  if (!SUPPORTED_CV_MIME_TYPES.has(mimeType)) {
    const error = new Error("Unsupported CV format. Use PDF, DOCX or TXT.");
    error.statusCode = 422;
    throw error;
  }

  if (!normalizedContent) {
    const error = new Error("contentBase64 is required");
    error.statusCode = 422;
    throw error;
  }

  if (!size || size > MAX_CV_UPLOAD_BYTES) {
    const error = new Error("CV file is too large. Maximum size is 5MB.");
    error.statusCode = 422;
    throw error;
  }

  return {
    fileName,
    mimeType,
    size,
    contentBase64: normalizedContent
  };
};

const validateUpdateProfileRequest = (payload) => {
  const updates = {};

  if (typeof payload?.professional_title === "string" && payload.professional_title.trim()) {
    updates.professional_title = payload.professional_title.trim();
  }

  if (typeof payload?.summary === "string") {
    updates.summary = payload.summary.trim();
  }

  if (typeof payload?.phone === "string") {
    updates.phone = payload.phone.trim();
  }

  if (typeof payload?.address === "string") {
    updates.address = payload.address.trim();
  }

  if (typeof payload?.linkedin_url === "string") {
    updates.linkedin_url = payload.linkedin_url.trim();
  }

  if (typeof payload?.github_url === "string") {
    updates.github_url = payload.github_url.trim();
  }

  if (typeof payload?.portfolio_url === "string") {
    updates.portfolio_url = payload.portfolio_url.trim();
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error("No valid profile fields provided");
    error.statusCode = 422;
    throw error;
  }

  return updates;
};

module.exports = {
  validateCreateProfileRequest,
  validateUpdateProfileRequest,
  validateUpsertProfileCVRequest
};

