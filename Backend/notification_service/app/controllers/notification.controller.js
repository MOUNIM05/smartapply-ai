const {
  validateCreateInternalNotificationRequest,
  validateListNotificationsQuery
} = require("../schemas/notification.schema");
const {
  createNotification,
  listNotificationsForUser,
  markNotificationAsRead,
  archiveNotification,
  markAllNotificationsAsRead,
  listNotificationsAdmin
} = require("../services/notification.service");

const createInternalNotificationController = async (req, res, next) => {
  try {
    const payload = validateCreateInternalNotificationRequest(req.body);
    const result = await createNotification(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listMyNotificationsController = async (req, res, next) => {
  try {
    const options = validateListNotificationsQuery(req.query);
    const result = await listNotificationsForUser(req.user.userId, options);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const markMyNotificationAsReadController = async (req, res, next) => {
  try {
    const result = await markNotificationAsRead(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const markAllMyNotificationsAsReadController = async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsRead(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const archiveMyNotificationController = async (req, res, next) => {
  try {
    const result = await archiveNotification(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const listNotificationsController = async (req, res, next) => {
  try {
    const options = validateListNotificationsQuery(req.query);
    const result = await listNotificationsAdmin(options);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInternalNotificationController,
  listMyNotificationsController,
  markMyNotificationAsReadController,
  archiveMyNotificationController,
  markAllMyNotificationsAsReadController,
  listNotificationsController
};
