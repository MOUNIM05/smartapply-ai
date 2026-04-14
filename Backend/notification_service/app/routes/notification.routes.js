const express = require("express");

const {
  verifyToken,
  requireAdmin,
  requireInternalService
} = require("../middlewares/auth.middleware");
const {
  createInternalNotificationController,
  listMyNotificationsController,
  markMyNotificationAsReadController,
  archiveMyNotificationController,
  markAllMyNotificationsAsReadController,
  listNotificationsController
} = require("../controllers/notification.controller");

const router = express.Router();

router.post("/notifications/internal", requireInternalService, createInternalNotificationController);
router.get("/notifications/me", verifyToken, listMyNotificationsController);
router.patch("/notifications/me/read-all", verifyToken, markAllMyNotificationsAsReadController);
router.patch("/notifications/:id/read", verifyToken, markMyNotificationAsReadController);
router.patch("/notifications/:id/archive", verifyToken, archiveMyNotificationController);
router.get("/notifications", verifyToken, requireAdmin, listNotificationsController);

module.exports = router;
