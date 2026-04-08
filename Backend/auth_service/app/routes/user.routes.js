const express = require("express");

const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");
const {
  getMeController,
  updateMeController,
  deleteMeController,
  listUsersController,
  getUserByIdController,
  createUserController,
  updateUserByIdController,
  deleteUserByIdController
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/users/me", verifyToken, getMeController);
router.put("/users/me", verifyToken, updateMeController);
router.delete("/users/me", verifyToken, deleteMeController);

router.get("/users", verifyToken, requireAdmin, listUsersController);
router.get("/users/:id", verifyToken, requireAdmin, getUserByIdController);
router.post("/users", verifyToken, requireAdmin, createUserController);
router.put("/users/:id", verifyToken, requireAdmin, updateUserByIdController);
router.delete("/users/:id", verifyToken, requireAdmin, deleteUserByIdController);

module.exports = router;
