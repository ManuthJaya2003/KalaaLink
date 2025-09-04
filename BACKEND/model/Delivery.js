const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  artId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Art',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
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
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Handed to Delivery Company', 'Delivered'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Delivery', deliverySchema);