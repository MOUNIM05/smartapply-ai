const validateUpdateMeRequest = (payload) => {
  const updates = {};

  if (typeof payload?.first_name === "string" && payload.first_name.trim()) {
    updates.first_name = payload.first_name.trim();
  }

  if (typeof payload?.last_name === "string" && payload.last_name.trim()) {
    updates.last_name = payload.last_name.trim();
  }

  if (typeof payload?.email === "string" && payload.email.trim()) {
    updates.email = payload.email.trim().toLowerCase();
  }

  if (typeof payload?.password === "string" && payload.password.trim()) {
    if (payload.password.trim().length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 422;
      throw error;
    }

    updates.password = payload.password.trim();
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error("No valid fields provided");
    error.statusCode = 422;
    throw error;
  }

  return updates;
};

const validateCreateUserRequest = (payload) => {
  const first_name = payload?.first_name?.trim();
  const last_name = payload?.last_name?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;
  const role = payload?.role?.trim?.() || "user";

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

  if (!["user", "admin"].includes(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 422;
    throw error;
  }

  return {
    first_name,
    last_name,
    email,
    password,
    role
  };
};

const validateAdminUpdateUserRequest = (payload) => {
  const updates = {};

  if (typeof payload?.first_name === "string" && payload.first_name.trim()) {
    updates.first_name = payload.first_name.trim();
  }

  if (typeof payload?.last_name === "string" && payload.last_name.trim()) {
    updates.last_name = payload.last_name.trim();
  }

  if (typeof payload?.email === "string" && payload.email.trim()) {
    updates.email = payload.email.trim().toLowerCase();
  }

  if (typeof payload?.password === "string" && payload.password.trim()) {
    if (payload.password.trim().length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 422;
      throw error;
    }

    updates.password = payload.password.trim();
  }

  if (typeof payload?.role === "string" && payload.role.trim()) {
    const role = payload.role.trim();

    if (!["user", "admin"].includes(role)) {
      const error = new Error("Invalid role");
      error.statusCode = 422;
      throw error;
    }

    updates.role = role;
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error("No valid fields provided");
    error.statusCode = 422;
    throw error;
  }

  return updates;
};

module.exports = {
  validateUpdateMeRequest,
  validateCreateUserRequest,
  validateAdminUpdateUserRequest
};
