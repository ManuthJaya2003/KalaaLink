const Review = require('../model/Review');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, customerName, rating, comment } = req.body;
    console.log('Received review:', { productId, customerName, rating, comment }); // Add logging
    // Basic validation
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = new Review({ productId, customerName, rating, comment });
    await review.save();
    console.log('Saved review:', review); // Add logging
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error.message, error.stack); // Enhance logging
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    console.log('Fetched all reviews:', reviews.length); // Add logging
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error.message, error.stack); // Enhance logging
    res.status(500).json({ message: 'Error fetching all reviews', error: error.message });
  }
};

// Get reviews for a product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    console.log(`Fetched reviews for product ${req.params.productId}:`, reviews.length); // Add logging
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message, error.stack); // Enhance logging
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    console.log('Deleted review:', review._id); // Add logging
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error.message, error.stack); // Enhance logging
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};