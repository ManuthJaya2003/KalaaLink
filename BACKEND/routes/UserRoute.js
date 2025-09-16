const express = require("express");
const router = express.Router();

// User model will be loaded via controller

const UserController = require("../controllers/UserController")

router.get("/",UserController.getAllUsers);

// Register a new user
router.post("/register", UserController.registerUser);

// Get user signup statistics
router.get("/stats/signups", UserController.getUserSignupStats);

// Get recent users
router.get("/recent", UserController.getRecentUsers);

// Deactivate user
router.put("/:userId/deactivate", UserController.deactivateUser);

// Clear (permanently delete) user record
router.delete("/:userId/clear", UserController.clearUser);

// Login
router.post("/login", UserController.loginUser);

module.exports = router;