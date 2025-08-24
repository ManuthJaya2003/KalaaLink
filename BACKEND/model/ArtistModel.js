const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ---------------------- Booking Schema ----------------------
const bookingSchema = new Schema(
  {
    customerName: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    details: { type: String },
  },
  { timestamps: true }
);

// ---------------------- Portfolio Schema ----------------------
const portfolioItemSchema = new Schema(
  {
    type: { type: String, required: true }, // e.g., "video", "image", "document"
    url: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// ---------------------- Artist Schema ----------------------
const artistSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    stageName: { type: String, required: true },
    bio: { type: String, required: true },
    password: { type: String, required: true }, // (Hash this in production)
    
    isApproved: { type: Boolean, default: false }, 
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ---------------------- Dashboard fields ----------------------
    profileImage: { type: String }, // URL or local path
    coverImage: { type: String },   // URL or local path

    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },

    bookingPrice: { type: Number, default: 0 }, // 💰 Booking Price field

    portfolioItems: [portfolioItemSchema],
    bookings: [bookingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", artistSchema);
