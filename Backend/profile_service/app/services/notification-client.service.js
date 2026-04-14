// Implements Notification client.service business logic for the Profile service.
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5005";
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || "change_me";
const NOTIFICATION_TIMEOUT_MS = Number(process.env.NOTIFICATION_TIMEOUT_MS || 3000);

const sendNotification = async (payload) => {
  if (!payload?.userId) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFICATION_TIMEOUT_MS);

  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/internal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-service-token": INTERNAL_SERVICE_TOKEN
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Notification service error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.error("Notification dispatch failed in profile service:", error.message);
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  sendNotification
};
