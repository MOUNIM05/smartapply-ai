const ALLOWED_PAID_PLANS = ["student", "premium"];

const validateCreateCheckoutSessionRequest = (payload) => {
  const plan = typeof payload?.plan === "string" ? payload.plan.trim().toLowerCase() : "";

  if (!ALLOWED_PAID_PLANS.includes(plan)) {
    const error = new Error("Invalid plan. Use student or premium.");
    error.statusCode = 422;
    throw error;
  }

  return { plan };
};

const validateConfirmCheckoutSessionRequest = (payload) => {
  const sessionId = typeof payload?.session_id === "string" ? payload.session_id.trim() : "";

  if (!sessionId || !sessionId.startsWith("cs_")) {
    const error = new Error("Invalid Stripe checkout session id.");
    error.statusCode = 422;
    throw error;
  }

  return { sessionId };
};

module.exports = {
  validateCreateCheckoutSessionRequest,
  validateConfirmCheckoutSessionRequest
};
