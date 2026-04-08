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

module.exports = {
  validateLoginRequest
};
