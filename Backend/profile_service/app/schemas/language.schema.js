const validateCreateLanguageRequest = (payload) => {
  const name = payload?.name?.trim();
  const level = payload?.level?.trim() || "";

  if (!name) {
    const error = new Error("Language name is required");
    error.statusCode = 422;
    throw error;
  }

  return {
    name,
    level
  };
};

const validateUpdateLanguageRequest = (payload) => {
  const updates = {};

  if (typeof payload?.name === "string" && payload.name.trim()) {
    updates.name = payload.name.trim();
  }

  if (typeof payload?.level === "string") {
    updates.level = payload.level.trim();
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error("No valid language fields provided");
    error.statusCode = 422;
    throw error;
  }

  return updates;
};

module.exports = {
  validateCreateLanguageRequest,
  validateUpdateLanguageRequest
};
