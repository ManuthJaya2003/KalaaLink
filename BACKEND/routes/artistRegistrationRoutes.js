const express = require("express");
const router = express.Router();
const artistController = require("../controllers/ArtistRegistrationController");

// Register artist
router.post("/", artistController.registerArtist);

// Get all artists for an event
router.get("/:id", artistController.getArtistsByEvent);

// Delete artist registration
router.delete("/:id", artistController.deleteArtist);

module.exports = router;
