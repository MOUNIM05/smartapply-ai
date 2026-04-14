/**
 * Couche service - user.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const { User } = require("../models/auth.model");
const { hashPassword } = require("./auth.service");
const { sendNotification } = require("./notification-client.service");

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

  await sendNotification({
    userId: String(user._id),
    title: "Compte mis a jour",
    message: "Les informations de votre compte ont ete mises a jour.",
    type: "system",
    event: "user_updated",
    sourceService: "auth-service",
    metadata: {
      updatedFields: Object.keys(updates)
    }
  });

  return {
    message: "Profile updated successfully",
    user: sanitizeUser(user)
  };
};

const deleteCurrentUser = async (userId) => {
  const user = await findUserByIdOrThrow(userId);

  await sendNotification({
    userId: String(user._id),
    title: "Compte supprime",
    message: "Votre compte a ete supprime.",
    type: "system",
    event: "user_deleted",
    sourceService: "auth-service",
    metadata: {
      email: user.email
    }
  });

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

const createUserByAdmin = async ({ first_name, last_name, email, password, role }, actorUserId) => {
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

  await sendNotification({
    userId: String(user._id),
    title: "Compte cree",
    message: "Un administrateur a cree votre compte.",
    type: "system",
    event: "user_created_by_admin",
    sourceService: "auth-service",
    metadata: {
      email: user.email,
      role: user.role,
      actorUserId: String(actorUserId)
    }
  });

  return {
    message: "User created successfully",
    user: sanitizeUser(user)
  };
};

const updateUserByAdmin = async (userId, updates, actorUserId) => {
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

  await sendNotification({
    userId: String(user._id),
    title: "Compte mis a jour",
    message: "Un administrateur a mis a jour votre compte.",
    type: "system",
    event: "user_updated_by_admin",
    sourceService: "auth-service",
    metadata: {
      updatedFields: Object.keys(updates),
      actorUserId: String(actorUserId)
    }
  });

  return {
    message: "User updated successfully",
    user: sanitizeUser(user)
  };
};

const deleteUserByAdmin = async (userId, actorUserId) => {
  const user = await findUserByIdOrThrow(userId);

  await sendNotification({
    userId: String(user._id),
    title: "Compte supprime",
    message: "Un administrateur a supprime votre compte.",
    type: "system",
    event: "user_deleted_by_admin",
    sourceService: "auth-service",
    metadata: {
      actorUserId: String(actorUserId),
      email: user.email
    }
  });

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

