const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const donorSchema = new Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Amount: {
    type: Number,
    required: true,
  },
  DonorNote: {
    type: String,
    required: false, // Optional field
  },
  // ✅ Donation system enhancements
  packageId: {
    type: Schema.Types.ObjectId,
    ref: 'Package',
    required: false, // Optional - for custom donations
  },
  packageName: {
    type: String,
    required: false, // Store package name for reference
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending',
  },
  stripePaymentIntentId: {
    type: String,
    required: false, // Store Stripe payment intent ID
  },
  stripeSessionId: {
    type: String,
    required: false, // Store Stripe session ID
  },
  paymentDate: {
    type: Date,
    required: false, // When payment was completed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Donor", donorSchema);