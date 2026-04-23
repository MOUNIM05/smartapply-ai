const {
  validateCreateCheckoutSessionRequest,
  validateConfirmCheckoutSessionRequest
} = require("../schemas/subscription.schema");
const { createCheckoutSession, confirmCheckoutSession } = require("../services/subscription.service");

const createCheckoutSessionController = async (req, res, next) => {
  try {
    const { plan } = validateCreateCheckoutSessionRequest(req.body);
    const result = await createCheckoutSession(req.user.userId, plan);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const confirmCheckoutSessionController = async (req, res, next) => {
  try {
    const { sessionId } = validateConfirmCheckoutSessionRequest(req.body);
    const result = await confirmCheckoutSession(req.user.userId, sessionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSessionController,
  confirmCheckoutSessionController
};
