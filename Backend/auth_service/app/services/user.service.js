/**
 * Couche service - user.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { User } = require("../models/auth.model");
const { hashPassword } = require("./auth.service");

const sanitizeUser = (user) => ({
  id: user._id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const findUserByIdOrThrow = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const getCurrentUser = async (userId) => {
  const user = await findUserByIdOrThrow(userId);

  return {
    user: sanitizeUser(user)
  };
};

const updateCurrentUser = async (userId, updates) => {
  const user = await findUserByIdOrThrow(userId);

  if (updates.email && updates.email !== user.email) {
    const existingUser = await User.findOne({ email: updates.email });

    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  if (updates.first_name) {
    user.first_name = updates.first_name;
  }

  if (updates.last_name) {
    user.last_name = updates.last_name;
  }

  if (updates.email) {
    user.email = updates.email;
  }

  if (updates.password) {
    user.password = await hashPassword(updates.password);
  }

  await user.save();

  return {
    message: "Profile updated successfully",
    user: sanitizeUser(user)
  };
};

const deleteCurrentUser = async (userId) => {
  await findUserByIdOrThrow(userId);

  await User.findByIdAndDelete(userId);

  return {
    message: "Account deleted successfully"
  };
};

const listUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });

  return {
    users: users.map(sanitizeUser)
  };
};

const getUserById = async (userId) => {
  const user = await findUserByIdOrThrow(userId);

  return {
    user: sanitizeUser(user)
  };
};

const createUserByAdmin = async ({ first_name, last_name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    role
  });

  return {
    message: "User created successfully",
    user: sanitizeUser(user)
  };
};

const updateUserByAdmin = async (userId, updates) => {
  const user = await findUserByIdOrThrow(userId);

  if (updates.email && updates.email !== user.email) {
    const existingUser = await User.findOne({ email: updates.email });

    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  if (updates.first_name) {
    user.first_name = updates.first_name;
  }

  if (updates.last_name) {
    user.last_name = updates.last_name;
  }

  if (updates.email) {
    user.email = updates.email;
  }

  if (updates.password) {
    user.password = await hashPassword(updates.password);
  }

  if (updates.role) {
    user.role = updates.role;
  }

  await user.save();

  return {
    message: "User updated successfully",
    user: sanitizeUser(user)
  };
};

const deleteUserByAdmin = async (userId) => {
  await findUserByIdOrThrow(userId);

  await User.findByIdAndDelete(userId);

  return {
    message: "User deleted successfully"
  };
};

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  listUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
};

