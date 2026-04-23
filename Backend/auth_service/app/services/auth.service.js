/**
 * Couche service - auth.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/auth.model");
const { sendNotification } = require("./notification-client.service");

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Wrong password");
    error.statusCode = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured");
    error.statusCode = 500;
    throw error;
  }

  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );

  await sendNotification({
    userId: String(user._id),
    title: "Connexion reussie",
    message: "Vous etes connecte a la plateforme.",
    type: "system",
    event: "auth_login",
    sourceService: "auth-service",
    metadata: {
      email: user.email,
      role: user.role
    }
  });

  return {
    access_token: accessToken,
    token_type: "bearer"
  };
};

const register = async ({ first_name, last_name, email, password }) => {
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
    address: "",
    avatar_url: "",
    password: hashedPassword,
    role: "user"
  });

  await sendNotification({
    userId: String(user._id),
    title: "Compte cree",
    message: "Votre compte a ete cree avec succes.",
    type: "system",
    event: "auth_register",
    sourceService: "auth-service",
    metadata: {
      email: user.email,
      role: user.role
    }
  });

  return {
    message: "User registered successfully",
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  };
};

const logout = async (authorizationHeader) => {
  try {
    const token = extractBearerToken(authorizationHeader);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      await sendNotification({
        userId: String(decoded.userId),
        title: "Deconnexion",
        message: "Vous avez ete deconnecte de la plateforme.",
        type: "system",
        event: "auth_logout",
        sourceService: "auth-service",
        metadata: {
          email: decoded.email,
          role: decoded.role
        }
      });
    }
  } catch (error) {
    console.error("Unable to attach logout notification:", error.message);
  }

  return {
    message: "Logged out successfully"
  };
};

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 10);
};

module.exports = {
  login,
  register,
  logout,
  hashPassword
};

