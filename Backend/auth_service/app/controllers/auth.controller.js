const { validateLoginRequest } = require("../schemas/auth.schema");
const { login } = require("../services/auth.service");

const loginController = async (req, res, next) => {
  try {
    const payload = validateLoginRequest(req.body);
    const result = await login(payload);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginController
};
