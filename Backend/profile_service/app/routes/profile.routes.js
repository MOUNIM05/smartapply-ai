// Registers Profile.routes routes for the Profile service.
const express = require("express");

const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");
const {
  createProfileController,
  getMyProfileController,
  listProfilesController,
  getProfileByIdController,
  updateMyProfileController,
  deleteMyProfileController,
  createProfileByAdminController,
  updateProfileByIdController,
  deleteProfileByIdController
} = require("../controllers/profile.controller");

const router = express.Router();

router.post("/profiles", verifyToken, createProfileController);
router.get("/profiles/me", verifyToken, getMyProfileController);
router.put("/profiles/me", verifyToken, updateMyProfileController);
router.delete("/profiles/me", verifyToken, deleteMyProfileController);
router.get("/profiles", verifyToken, requireAdmin, listProfilesController);
router.post("/profiles/admin", verifyToken, requireAdmin, createProfileByAdminController);
router.get("/profiles/:id", verifyToken, requireAdmin, getProfileByIdController);
router.put("/profiles/:id", verifyToken, requireAdmin, updateProfileByIdController);
router.delete("/profiles/:id", verifyToken, requireAdmin, deleteProfileByIdController);

module.exports = router;
