/**
 * Couche service - auth.service.js
 * Contient la logique metier et centralise les appels aux modeles MongoDB.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/auth.model");

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
    password: hashedPassword,
    role: "user"
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

const logout = async () => {
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

