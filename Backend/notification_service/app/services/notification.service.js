// Implements Notification.service business logic for the Notification service.
const { Notification } = require("../models/notification.model");

const serializeNotification = (notification) => ({
  id: notification._id,
  userId: notification.userId,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  event: notification.event,
  sourceService: notification.sourceService,
  metadata: notification.metadata,
  isRead: notification.isRead,
  readAt: notification.readAt,
  isArchived: notification.isArchived,
  archivedAt: notification.archivedAt,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt
});

const createNotification = async (payload) => {
  const notification = await Notification.create(payload);

  return {
    message: "Notification created successfully",
    notification: serializeNotification(notification)
  };
};

const listNotificationsForUser = async (userId, options = {}) => {
  const query = {
    userId
  };

  if (options.archivedOnly) {
    query.isArchived = true;
  } else if (!options.includeArchived) {
    query.isArchived = false;
  }

  if (options.unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);

  return {
    notifications: notifications.map(serializeNotification)
  };
};

const markNotificationAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
    isArchived: false
  });

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return {
    message: "Notification marked as read",
    notification: serializeNotification(notification)
  };
};

const archiveNotification = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId
  });

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (!notification.isArchived) {
    notification.isArchived = true;
    notification.archivedAt = new Date();

    // Consider archived notifications as read to keep timeline fields consistent in UI.
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
    }

    await notification.save();
  }

  return {
    message: "Notification archived successfully",
    notification: serializeNotification(notification)
  };
};

const markAllNotificationsAsRead = async (userId) => {
  const readAt = new Date();

  const result = await Notification.updateMany(
    {
      userId,
      isRead: false,
      isArchived: false
    },
    {
      $set: {
        isRead: true,
        readAt
      }
    }
  );

  return {
    message: "Notifications marked as read",
    updatedCount: result.modifiedCount
  };
};

const listNotificationsAdmin = async (options = {}) => {
  const query = {};

  if (options.userId) {
    query.userId = options.userId;
  }

  if (options.archivedOnly) {
    query.isArchived = true;
  } else if (!options.includeArchived) {
    query.isArchived = false;
  }

  if (options.unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);

  return {
    notifications: notifications.map(serializeNotification)
  };
};

module.exports = {
  createNotification,
  listNotificationsForUser,
  markNotificationAsRead,
  archiveNotification,
  markAllNotificationsAsRead,
  listNotificationsAdmin
};
