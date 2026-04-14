// Registers Skill.routes routes for the Profile service.
const express = require("express");

const { verifyToken } = require("../middlewares/auth.middleware");
const {
  listMySkillsController,
  createSkillController,
  updateSkillController,
  deleteSkillController
} = require("../controllers/skill.controller");

const router = express.Router();

router.get("/skills/me", verifyToken, listMySkillsController);
router.post("/skills", verifyToken, createSkillController);
router.put("/skills/:id", verifyToken, updateSkillController);
router.delete("/skills/:id", verifyToken, deleteSkillController);

module.exports = router;
