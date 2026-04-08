const { validateLoginRequest, validateRegisterRequest } = require("../schemas/auth.schema");
const { login, register, logout } = require("../services/auth.service");

const loginController = async (req, res, next) => {
  try {
    const payload = validateLoginRequest(req.body);
    const result = await login(payload);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const registerController = async (req, res, next) => {
  try {
    const payload = validateRegisterRequest(req.body);
    const result = await register(payload);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const logoutController = async (req, res, next) => {
  try {
    const result = await logout();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginController,
  registerController,
  logoutController
};
