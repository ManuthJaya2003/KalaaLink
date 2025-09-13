const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// Authentication routes under /api/auth
router.post("/signup", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/logout", UserController.logoutUser);
router.put("/update-profile", UserController.updateUserProfile);
router.delete("/delete-profile", UserController.deleteUserProfile);

module.exports = router;
