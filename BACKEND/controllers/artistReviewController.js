const ArtistReview = require('../model/ArtistReview');

// Create a new artist review
exports.createArtistReview = async (req, res) => {
  try {
    const { artistId, artistName, customerName, rating, reviewText } = req.body;
    
    // Basic validation
    if (!artistId || !artistName || !customerName || !rating || !reviewText) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = new ArtistReview({ 
      artistId, 
      artistName, 
      customerName, 
      rating, 
      reviewText 
    });
    
    await review.save();
    console.log('Saved artist review:', review);
    res.status(201).json({ 
      message: 'Review created successfully', 
      review 
    });
  } catch (error) {
    console.error('Error creating artist review:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Error creating review', 
      error: error.message 
    });
  }
};

// Get all artist reviews
exports.getAllArtistReviews = async (req, res) => {
  try {
    const reviews = await ArtistReview.find().sort({ createdAt: -1 });
    console.log('Fetched all artist reviews:', reviews.length);
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching all artist reviews:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Error fetching all reviews', 
      error: error.message 
    });
  }
};

// Get reviews for a specific artist
exports.getReviewsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const reviews = await ArtistReview.find({ artistId }).sort({ createdAt: -1 });
    console.log(`Fetched reviews for artist ${artistId}:`, reviews.length);
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching artist reviews:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Error fetching reviews', 
      error: error.message 
    });
  }
};

// Delete an artist review
exports.deleteArtistReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await ArtistReview.findByIdAndDelete(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    console.log('Deleted artist review:', review._id);
    res.json({ 
      message: 'Review deleted successfully',
      review 
    });
  } catch (error) {
    console.error('Error deleting artist review:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Error deleting review', 
      error: error.message 
    });
  }
};

// Update an artist review
exports.updateArtistReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, rating, reviewText } = req.body;
    
    const updateData = {};
    if (customerName) updateData.customerName = customerName;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updateData.rating = rating;
    }
    if (reviewText) updateData.reviewText = reviewText;
    
    updateData.updatedAt = new Date();
    
    const review = await ArtistReview.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    console.log('Updated artist review:', review._id);
    res.json({ 
      message: 'Review updated successfully',
      review 
    });
  } catch (error) {
    console.error('Error updating artist review:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Error updating review', 
      error: error.message 
    });
  }
};
