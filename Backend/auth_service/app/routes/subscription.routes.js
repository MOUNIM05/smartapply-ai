const express = require("express");

const { verifyToken } = require("../middlewares/auth.middleware");
const {
  createCheckoutSessionController,
  confirmCheckoutSessionController
} = require("../controllers/subscription.controller");

const router = express.Router();

router.post("/subscriptions/checkout-session", verifyToken, createCheckoutSessionController);
router.post("/subscriptions/confirm", verifyToken, confirmCheckoutSessionController);

module.exports = router;
