const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");
const { authenticateToken } = require("../middleware/auth");

// Protected routes (authentication required)
router.post("/artist-locations", authenticateToken, locationController.getArtistLocations);
router.put("/artist-location", authenticateToken, locationController.updateArtistLocation);

module.exports = router;
