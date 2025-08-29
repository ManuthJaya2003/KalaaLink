const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const ArtistController = require("../controllers/ArtistController");

// ---------------------- Multer setup ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder inside project
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ---------------------- Artist Auth ----------------------
// Register new artist
router.post("/register", ArtistController.registerArtist);

// Login artist
router.post("/login", ArtistController.loginArtist);

// ---------------------- Artist Profile ----------------------
// Get profile (approved only)
router.get("/:artist_id", ArtistController.getArtistProfile);

// Update profile info (approved only)
router.put("/:artist_id", ArtistController.updateArtistProfile);

// Delete profile
router.delete("/:artist_id", ArtistController.deleteArtistProfile);

// ---------------------- Artist Dashboard ----------------------

// Update profile & cover images (2 files)
router.put(
  "/:artist_id/images",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  ArtistController.updateArtistImages
);

// Update social links
router.put("/:artist_id/social", ArtistController.updateSocialLinks);

// Portfolio CRUD
// Add portfolio item (1 file)
router.post("/:artist_id/portfolio", upload.single("file"), ArtistController.addPortfolioItem);

// Delete portfolio item
router.delete("/:artist_id/portfolio", ArtistController.deletePortfolioItem);

// Bookings
router.get("/:artist_id/bookings", ArtistController.getArtistBookings);
router.put("/:artist_id/bookings", ArtistController.updateBookingStatus);

module.exports = router;
