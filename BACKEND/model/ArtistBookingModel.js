const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArtistBookingSchema = new Schema(
  {
    artist: { 
      type: Schema.Types.ObjectId, 
      required: true 
    }, // Stores the ID of the artist

    artistModel: { 
      type: String, 
      enum: ["artistmanagermodels", "artists"], 
      required: true 
    }, // Tells mongoose which collection the artist belongs to

    // Customer details
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhoneNumber: { type: String, required: true },

    // Event details
    eventType: { type: String, required: true }, 
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: true },
    eventVenue: { type: String, required: true },
    eventLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArtistBooking", ArtistBookingSchema);
