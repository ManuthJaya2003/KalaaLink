const mongoose = require('mongoose');

const artistReviewSchema = new mongoose.Schema({
  artistId: {
    type: String,
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArtistReview', artistReviewSchema);
