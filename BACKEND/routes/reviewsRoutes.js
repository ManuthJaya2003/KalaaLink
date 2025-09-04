const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review routes
router.get('/', reviewController.getAllReviews); // Added to handle GET /api/reviews
router.post('/', reviewController.createReview);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;