const express = require("express");
const router = express.Router();

const User = require("../model/UserModel")

const UserController = require("../controllers/UserController")

router.get("/",UserController.getAllUsers);

// Register a new user
router.post("/register", UserController.registerUser);

// Login
router.post("/login", UserController.loginUser);

module.exports = router;