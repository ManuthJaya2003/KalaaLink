const express = require("express");
const router = express.Router();
const ArtistCombinedController = require("../controllers/ArtistCombinedController");

// Fetch all approved artists (self + manager)
router.get("/allArtists", ArtistCombinedController.getAllApprovedArtists);

module.exports = router;
