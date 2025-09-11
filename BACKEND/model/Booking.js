const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'eventModel', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  ticketsBooked: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending"   // default is pending until Stripe confirms
  },
  paymentIntentId: { type: String }, // Stripe payment intent ID
  sessionId: { type: String }, // Stripe session ID
  originalStatus: { type: String }, // Track original status before cancellation for refund tracking
  cancelledDate: { type: Date } // When the booking was cancelled
});

module.exports = mongoose.model("Booking", bookingSchema);
