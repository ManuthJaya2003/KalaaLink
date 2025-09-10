const express = require("express");
const router = express.Router();

// User model will be loaded via controller

const UserController = require("../controllers/UserController")

router.get("/",UserController.getAllUsers);

// Register a new user
router.post("/register", UserController.registerUser);

// Login
router.post("/login", UserController.loginUser);

module.exports = router;