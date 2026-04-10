/**
 * Schema de validation - skill.schema.js
 * Decrit et valide les donnees recues avant leur traitement par les services.
 */
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

