// Registers Language.routes routes for the Profile service.
const express = require("express");

const { verifyToken } = require("../middlewares/auth.middleware");
const {
  listMyLanguagesController,
  createLanguageController,
  updateLanguageController,
  deleteLanguageController
} = require("../controllers/language.controller");

const router = express.Router();

router.get("/languages/me", verifyToken, listMyLanguagesController);
router.post("/languages", verifyToken, createLanguageController);
router.put("/languages/:id", verifyToken, updateLanguageController);
router.delete("/languages/:id", verifyToken, deleteLanguageController);

module.exports = router;
