const express = require("express");

const { loginController, registerController, logoutController } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/auth/register", registerController);
router.post("/auth/login", loginController);
router.post("/auth/logout", logoutController);

module.exports = router;
