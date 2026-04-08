const express = require("express");

const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");
const {
  createProfileController,
  getMyProfileController,
  listProfilesController,
  getProfileByIdController,
  updateMyProfileController,
  deleteMyProfileController
} = require("../controllers/profile.controller");

const router = express.Router();

router.post("/profiles", verifyToken, createProfileController);
router.get("/profiles/me", verifyToken, getMyProfileController);
router.put("/profiles/me", verifyToken, updateMyProfileController);
router.delete("/profiles/me", verifyToken, deleteMyProfileController);
router.get("/profiles", verifyToken, requireAdmin, listProfilesController);
router.get("/profiles/:id", verifyToken, requireAdmin, getProfileByIdController);

module.exports = router;
