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
      email: user.email
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

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 10);
};

module.exports = {
  login,
  hashPassword
};
