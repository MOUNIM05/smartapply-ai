const validateCreateSkillRequest = (payload) => {
  const name = payload?.name?.trim();

  if (!name) {
    const error = new Error("Skill name is required");
    error.statusCode = 422;
    throw error;
  }

  return { name };
};

const validateUpdateSkillRequest = (payload) => {
  const name = payload?.name?.trim();

  if (!name) {
    const error = new Error("Skill name is required");
    error.statusCode = 422;
    throw error;
  }

  return { name };
};

module.exports = {
  validateCreateSkillRequest,
  validateUpdateSkillRequest
};
