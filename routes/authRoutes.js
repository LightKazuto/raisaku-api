const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/users/:id", userController.updateUser);
router.patch("/users/:id", userController.updateUser);
router.put("/:id", userController.updateUser);
router.patch("/:id", userController.updateUser);

module.exports = router;
