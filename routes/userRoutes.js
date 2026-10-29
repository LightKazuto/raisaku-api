const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.patch("/:id", userController.updateUser);

module.exports = router;
