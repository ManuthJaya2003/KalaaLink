const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Single product order (legacy support)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Art',
  },
  quantity: {
    type: Number,
  },
  
  // Multiple products order (new structure)
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Art',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    },
  }],
  
  // Customer information
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
  },
  
  // Delivery information
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
  },
  deliveryAddress: {
    address: String,
    city: String,
    district: String,
    postalCode: String,
    contactNumber: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  useDelivery: {
    type: Boolean,
    default: false,
  },
  
  // Payment information
  totalAmount: {
    type: Number,
    required: true,
  },
  stripeSessionId: {
    type: String,
  },
  stripePaymentIntentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  
  // Order status
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: {
    type: Date,
  },
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);