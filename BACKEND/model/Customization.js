const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  description: { type: String, required: true },
  preferredSize: { type: String },
  preferredArtistName: { type: String },
  preferredColorPalette: { type: [String], default: [] },
  preferredArtType: { type: String },
  budget: { type: Number, default: 0 },
  additionalNotes: { type: String },
  productId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customization', customizationSchema);