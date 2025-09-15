const mongoose = require("mongoose");
const ArtistReview = require("../model/ArtistReview");
const ArtistManagerModel = require("../model/ArtistManagerModel");
const ArtistModel = require("../model/ArtistModel");

// Add a new review
const addReview = async (req, res) => {
  try {
    const { artistId, customerName, rating, review } = req.body;

    // Validate required fields
    if (!artistId || !customerName || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: artistId, customerName, rating, review"
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    // Check if artist exists in either collection
    const managerArtist = await ArtistManagerModel.findById(artistId);
    const selfArtist = await ArtistModel.findById(artistId);
    
    if (!managerArtist && !selfArtist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Create new review
    const newReview = new ArtistReview({
      artistId,
      customerName: customerName.trim(),
      rating,
      review: review.trim()
    });

    const savedReview = await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: savedReview
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all reviews for a specific artist
const getReviewsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({
        success: false,
        message: "Artist ID is required"
      });
    }

    // Check if artist exists in either collection
    const managerArtist = await ArtistManagerModel.findById(artistId);
    const selfArtist = await ArtistModel.findById(artistId);
    
    if (!managerArtist && !selfArtist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Get reviews sorted by creation date (newest first)
    const reviews = await ArtistReview.find({ artistId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      reviews,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get average rating for a specific artist
const getAverageRating = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({
        success: false,
        message: "Artist ID is required"
      });
    }

    // Check if artist exists in either collection
    const managerArtist = await ArtistManagerModel.findById(artistId);
    const selfArtist = await ArtistModel.findById(artistId);
    
    if (!managerArtist && !selfArtist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Calculate average rating
    const result = await ArtistReview.aggregate([
      { $match: { artistId: new mongoose.Types.ObjectId(artistId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

    res.status(200).json({
      success: true,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews
    });
  } catch (error) {
    console.error("Error calculating average rating:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete a review by ID
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required"
      });
    }

    // Check if review exists
    const review = await ArtistReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Delete the review
    await ArtistReview.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all reviews (for admin/manager dashboard)
const getAllReviews = async (req, res) => {
  try {
    // Get all reviews with artist information from both collections
    const reviews = await ArtistReview.aggregate([
      {
        $lookup: {
          from: "artistmanagermodels", // Manager-added artists
          localField: "artistId",
          foreignField: "_id",
          as: "managerArtist"
        }
      },
      {
        $lookup: {
          from: "artists", // Self-registered artists
          localField: "artistId",
          foreignField: "_id",
          as: "selfArtist"
        }
      },
      {
        $addFields: {
          artist: {
            $cond: {
              if: { $gt: [{ $size: "$managerArtist" }, 0] },
              then: {
                $mergeObjects: [
                  { $arrayElemAt: ["$managerArtist", 0] },
                  { artistName: { $arrayElemAt: ["$managerArtist.artistName", 0] } }
                ]
              },
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$selfArtist" }, 0] },
                  then: {
                    $mergeObjects: [
                      { $arrayElemAt: ["$selfArtist", 0] },
                      { artistName: { $arrayElemAt: ["$selfArtist.stageName", 0] } }
                    ]
                  },
                  else: {
                    artistName: "Unknown Artist",
                    genre: "Unknown",
                    category: "Unknown"
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          customerName: 1,
          rating: 1,
          review: 1,
          createdAt: 1,
          "artist.artistName": 1,
          "artist.genre": 1,
          "artist.category": 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      reviews,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  addReview,
  getReviewsByArtist,
  getAverageRating,
  deleteReview,
  getAllReviews
};
