// Provides Auth.middleware middleware for the Notification service.
const jwt = require("jsonwebtoken");

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};

const verifyToken = (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        message: "Access token is required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

const requireInternalService = (req, res, next) => {
  const internalToken = req.headers["x-internal-service-token"];

  if (!internalToken || internalToken !== (process.env.INTERNAL_SERVICE_TOKEN || "change_me")) {
    return res.status(403).json({
      message: "Internal service token is invalid"
    });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireInternalService
};
