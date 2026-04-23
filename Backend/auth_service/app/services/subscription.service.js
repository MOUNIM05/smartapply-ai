const Stripe = require("stripe");
const { User } = require("../models/auth.model");
const { sanitizeUser } = require("./user.service");
const { sendNotification } = require("./notification-client.service");

const STRIPE_API_VERSION = "2026-02-25.clover";

const PLAN_CONFIG = {
  student: {
    label: "Student",
    envPriceId: "STRIPE_PRICE_STUDENT_MONTHLY"
  },
  premium: {
    label: "Premium",
    envPriceId: "STRIPE_PRICE_PREMIUM_MONTHLY"
  }
};

let stripeClient = null;

const findUserByIdOrThrow = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
    error.statusCode = 503;
    throw error;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION
    });
  }

  return stripeClient;
};

const getPlanConfig = (plan) => {
  const config = PLAN_CONFIG[plan];

  if (!config) {
    const error = new Error("Invalid plan. Use student or premium.");
    error.statusCode = 422;
    throw error;
  }

  return config;
};

const getPlanPriceId = (plan) => {
  const config = getPlanConfig(plan);
  const priceId = process.env[config.envPriceId];

  if (!priceId) {
    const error = new Error(`Missing ${config.envPriceId}. Please configure Stripe monthly price IDs.`);
    error.statusCode = 503;
    throw error;
  }

  return priceId;
};

const appendQueryParams = (url, params) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    const invalidUrlError = new Error(`Invalid URL configuration: ${url}`);
    invalidUrlError.statusCode = 500;
    throw invalidUrlError;
  }

  Object.entries(params).forEach(([key, value]) => {
    parsedUrl.searchParams.set(key, value);
  });

  return parsedUrl.toString();
};

const resolvePlanFromStripeData = (stripeSubscription, metadataPlan) => {
  const priceId = stripeSubscription?.items?.data?.[0]?.price?.id;

  const matchedEntry = Object.entries(PLAN_CONFIG).find(([, config]) => {
    const configuredPriceId = process.env[config.envPriceId];
    return configuredPriceId && configuredPriceId === priceId;
  });

  if (matchedEntry) {
    return matchedEntry[0];
  }

  if (metadataPlan && PLAN_CONFIG[metadataPlan]) {
    return metadataPlan;
  }

  const error = new Error("Unable to resolve plan from Stripe subscription.");
  error.statusCode = 409;
  throw error;
};

const mapStripeSubscriptionStatus = (status) => {
  if (status === "active" || status === "trialing") {
    return "active";
  }

  if (status === "past_due" || status === "unpaid") {
    return "past_due";
  }

  if (status === "canceled" || status === "incomplete_expired") {
    return "canceled";
  }

  return "inactive";
};

const createCheckoutSession = async (userId, plan) => {
  const user = await findUserByIdOrThrow(userId);
  const stripe = getStripeClient();
  const priceId = getPlanPriceId(plan);
  const planConfig = getPlanConfig(plan);

  if (user.subscription_plan === plan && user.subscription_status === "active") {
    const error = new Error(`Your ${planConfig.label} monthly subscription is already active.`);
    error.statusCode = 409;
    throw error;
  }

  if (!user.stripe_customer_id) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      metadata: {
        userId: String(user._id)
      }
    });

    user.stripe_customer_id = customer.id;
    await user.save();
  }

  const successUrl = process.env.STRIPE_CHECKOUT_SUCCESS_URL || "http://localhost:5173/subscription";
  const cancelUrl = process.env.STRIPE_CHECKOUT_CANCEL_URL || "http://localhost:5173/subscription";

  const checkoutSuccessUrl = appendQueryParams(successUrl, {
    checkout: "success",
    session_id: "{CHECKOUT_SESSION_ID}"
  });

  const checkoutCancelUrl = appendQueryParams(cancelUrl, {
    checkout: "cancel"
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.stripe_customer_id,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    allow_promotion_codes: true,
    client_reference_id: String(user._id),
    success_url: checkoutSuccessUrl,
    cancel_url: checkoutCancelUrl,
    metadata: {
      userId: String(user._id),
      plan
    },
    subscription_data: {
      metadata: {
        userId: String(user._id),
        plan
      }
    }
  });

  return {
    message: "Checkout session created successfully.",
    checkout_url: checkoutSession.url,
    session_id: checkoutSession.id
  };
};

const confirmCheckoutSession = async (userId, sessionId) => {
  const user = await findUserByIdOrThrow(userId);
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"]
  });

  if (!session) {
    const error = new Error("Checkout session not found.");
    error.statusCode = 404;
    throw error;
  }

  if (session.mode !== "subscription") {
    const error = new Error("Invalid checkout mode for subscription confirmation.");
    error.statusCode = 409;
    throw error;
  }

  if (session.customer && user.stripe_customer_id && session.customer !== user.stripe_customer_id) {
    const error = new Error("This checkout session does not belong to the authenticated user.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.stripe_customer_id && typeof session.customer === "string") {
    user.stripe_customer_id = session.customer;
  }

  if (session.status !== "complete") {
    const error = new Error("Checkout session is not completed yet.");
    error.statusCode = 409;
    throw error;
  }

  let stripeSubscription = session.subscription;

  if (!stripeSubscription) {
    const error = new Error("No Stripe subscription found for this checkout session.");
    error.statusCode = 409;
    throw error;
  }

  if (typeof stripeSubscription === "string") {
    stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscription);
  }

  const plan = resolvePlanFromStripeData(stripeSubscription, session.metadata?.plan);
  const mappedStatus = mapStripeSubscriptionStatus(stripeSubscription.status);

  user.subscription_plan = plan;
  user.subscription_status = mappedStatus;
  user.subscription_interval = "monthly";
  user.subscription_started_at = stripeSubscription.current_period_start
    ? new Date(stripeSubscription.current_period_start * 1000)
    : new Date();
  user.subscription_renewal_at = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000)
    : null;
  user.stripe_subscription_id = stripeSubscription.id || "";

  await user.save();

  await sendNotification({
    userId: String(user._id),
    title: "Abonnement active",
    message: `Votre abonnement mensuel ${PLAN_CONFIG[plan].label} est actif.`,
    type: "system",
    event: "subscription_upgraded",
    sourceService: "auth-service",
    metadata: {
      plan,
      status: mappedStatus,
      renewalAt: user.subscription_renewal_at,
      stripeSubscriptionId: user.stripe_subscription_id
    }
  });

  return {
    message: "Subscription confirmed successfully.",
    user: sanitizeUser(user)
  };
};

module.exports = {
  createCheckoutSession,
  confirmCheckoutSession
};
