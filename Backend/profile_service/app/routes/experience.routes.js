// Registers Experience.routes routes for the Profile service.
const express = require("express");

const { verifyToken } = require("../middlewares/auth.middleware");
const {
  listMyExperiencesController,
  createExperienceController,
  updateExperienceController,
  deleteExperienceController
} = require("../controllers/experience.controller");

const router = express.Router();

router.get("/experiences/me", verifyToken, listMyExperiencesController);
router.post("/experiences", verifyToken, createExperienceController);
router.put("/experiences/:id", verifyToken, updateExperienceController);
router.delete("/experiences/:id", verifyToken, deleteExperienceController);

module.exports = router;
