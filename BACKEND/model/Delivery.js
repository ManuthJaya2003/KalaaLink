const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  artId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Art',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false, // Optional for legacy deliveries
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  // Map coordinates for delivery location
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  // Product details
  quantity: {
    type: Number,
    default: 1,
  },
  productName: {
    type: String,
    required: false,
  },
  productPrice: {
    type: Number,
    required: false,
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Dispatched', 'In Transit', 'Delivered', 'Failed'],
    default: 'Pending',
  },
  // Dispatch information
  dispatchedAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  notes: {
    type: String,
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

// Update the updatedAt field before saving
deliverySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);