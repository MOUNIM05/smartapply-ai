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
  validateUpdateProfileRequest
};

