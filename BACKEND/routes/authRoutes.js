const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes (no authentication required)
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/logout", authController.logout);

// Protected routes (authentication required)
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, upload.single('profilePicture'), authController.updateProfile);
router.delete("/profile", authenticateToken, authController.deleteProfile);

module.exports = router;
