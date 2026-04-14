// Registers Education.routes routes for the Profile service.
const express = require("express");

const { verifyToken } = require("../middlewares/auth.middleware");
const {
  listMyEducationsController,
  createEducationController,
  updateEducationController,
  deleteEducationController
} = require("../controllers/education.controller");

const router = express.Router();

router.get("/educations/me", verifyToken, listMyEducationsController);
router.post("/educations", verifyToken, createEducationController);
router.put("/educations/:id", verifyToken, updateEducationController);
router.delete("/educations/:id", verifyToken, deleteEducationController);

module.exports = router;
