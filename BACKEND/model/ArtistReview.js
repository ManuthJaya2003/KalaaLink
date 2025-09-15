const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Artist Review Schema
const artistReviewSchema = new Schema(
  {
    artistId: { 
      type: Schema.Types.ObjectId, 
      required: true 
    },
    artistType: {
      type: String,
      enum: ["manager", "self-registered"],
      default: "manager"
    },
    customerName: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5'
      }
    },
    review: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 1000
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true 
  }
);

// Index for efficient queries
artistReviewSchema.index({ artistId: 1, createdAt: -1 });

module.exports = mongoose.model("ArtistReview", artistReviewSchema);
