const express = require("express");
const router = express.Router();
const ArtistReviewController = require("../controllers/ArtistReviewController");

// POST /api/artist-reviews - Add a new review
router.post("/", ArtistReviewController.addReview);

// GET /api/artist-reviews - Get all reviews (for admin/manager dashboard)
// This must come BEFORE parameterized routes
router.get("/", ArtistReviewController.getAllReviews);

// GET /api/artist-reviews/export - Export all reviews as CSV
// This must come BEFORE parameterized routes
router.get("/export", ArtistReviewController.exportReviews);

// GET /api/artist-reviews/:artistId/average - Get average rating for a specific artist
// This must come BEFORE the general /:artistId route
router.get("/:artistId/average", ArtistReviewController.getAverageRating);

// GET /api/artist-reviews/:artistId - Get all reviews for a specific artist
router.get("/:artistId", ArtistReviewController.getReviewsByArtist);

// DELETE /api/artist-reviews/clear-all - Clear all reviews
// This must come BEFORE parameterized routes
router.delete("/clear-all", ArtistReviewController.clearAllReviews);

// DELETE /api/artist-reviews/:id - Delete a review by ID
router.delete("/:id", ArtistReviewController.deleteReview);

module.exports = router;
