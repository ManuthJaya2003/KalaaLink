const express = require('express');
const router = express.Router();
const artistReviewController = require('../controllers/artistReviewController');

// Artist review routes
router.get('/', artistReviewController.getAllArtistReviews);
router.post('/', artistReviewController.createArtistReview);
router.get('/artist/:artistId', artistReviewController.getReviewsByArtist);
router.put('/:id', artistReviewController.updateArtistReview);
router.delete('/:id', artistReviewController.deleteArtistReview);

module.exports = router;
