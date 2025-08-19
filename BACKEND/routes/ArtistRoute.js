const express = require("express");
const router = express.Router();

const ArtistController = require("../controllers/ArtistController");

// Register new artist
router.post("/register", ArtistController.registerArtist);

// Get artist profile (approved only)
router.get("/:artist_id", ArtistController.getArtistProfile);

// Update artist profile (approved only)
router.put("/:artist_id", ArtistController.updateArtistProfile);

// Delete artist profile
router.delete("/:artist_id", ArtistController.deleteArtistProfile);

module.exports = router;
