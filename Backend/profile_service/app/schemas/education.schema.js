const validateCreateEducationRequest = (payload) => {
  const title = payload?.title?.trim();
  const school = payload?.school?.trim();
  const period = payload?.period?.trim() || "";

  if (!title) {
    const error = new Error("Education title is required");
    error.statusCode = 422;
    throw error;
  }

  if (!school) {
    const error = new Error("School is required");
    error.statusCode = 422;
    throw error;
  }

  return {
    title,
    school,
    period
  };
};

const validateUpdateEducationRequest = (payload) => {
  const updates = {};

  if (typeof payload?.title === "string" && payload.title.trim()) {
    updates.title = payload.title.trim();
  }

  if (typeof payload?.school === "string" && payload.school.trim()) {
    updates.school = payload.school.trim();
  }

  if (typeof payload?.period === "string") {
    updates.period = payload.period.trim();
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error("No valid education fields provided");
    error.statusCode = 422;
    throw error;
  }

  return updates;
};

module.exports = {
  validateCreateEducationRequest,
  validateUpdateEducationRequest
};
