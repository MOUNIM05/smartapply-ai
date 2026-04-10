/**
 * Schema de validation - auth.schema.js
 * Decrit et valide les donnees recues avant leur traitement par les services.
 */
const validateLoginRequest = (payload) => {
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;

  if (!email || !password || typeof password !== "string") {
    const error = new Error("Invalid input");
    error.statusCode = 422;
    throw error;
  }

  return {
    email,
    password
  };
};

const validateRegisterRequest = (payload) => {
  const first_name = payload?.first_name?.trim();
  const last_name = payload?.last_name?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;

  if (!first_name || !last_name || !email || !password || typeof password !== "string") {
    const error = new Error("Invalid input");
    error.statusCode = 422;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.statusCode = 422;
    throw error;
  }

  return {
    first_name,
    last_name,
    email,
    password
  };
};

module.exports = {
  validateLoginRequest,
  validateRegisterRequest
};

