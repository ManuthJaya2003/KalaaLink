const express = require("express");
const router = express.Router();
const { validateQRCode } = require("../controllers/qrValidationController");

// QR Code validation route
router.post("/validate", validateQRCode);

module.exports = router;
