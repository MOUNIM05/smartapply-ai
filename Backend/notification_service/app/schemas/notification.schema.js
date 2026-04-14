// Validates Notification.schema payloads for the Notification service.
const NOTIFICATION_TYPES = [
  "job_application",
  "job_offer",
  "profile",
  "experience",
  "education",
  "skill",
  "language",
  "system"
];

const normalizeRequiredString = (value, fieldName) => {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 400;
    throw error;
  }

  return normalizedValue;
};

const validateCreateInternalNotificationRequest = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    const error = new Error("Notification payload must be an object");
    error.statusCode = 400;
    throw error;
  }

  const userId = normalizeRequiredString(payload.userId, "userId");
  const title = normalizeRequiredString(payload.title, "title");
  const message = normalizeRequiredString(payload.message, "message");
  const event = normalizeRequiredString(payload.event, "event");
  const sourceService = normalizeRequiredString(payload.sourceService, "sourceService");
  const type = normalizeRequiredString(payload.type, "type");

  if (!NOTIFICATION_TYPES.includes(type)) {
    const error = new Error("Invalid notification type");
    error.statusCode = 400;
    throw error;
  }

  const metadata =
    payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)
      ? payload.metadata
      : {};

  return {
    userId,
    title,
    message,
    type,
    event,
    sourceService,
    metadata
  };
};

const validateListNotificationsQuery = (query = {}) => {
  const parsedLimit = Number(query.limit || 20);
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;

  return {
    limit,
    unreadOnly: query.unreadOnly === "true",
    archivedOnly: query.archivedOnly === "true",
    includeArchived: query.includeArchived === "true",
    userId: typeof query.userId === "string" ? query.userId.trim() : ""
  };
};

module.exports = {
  validateCreateInternalNotificationRequest,
  validateListNotificationsQuery
};
