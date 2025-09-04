const mongoose = require('mongoose');

const artSchema = new mongoose.Schema({
  size: { type: String, required: true },
  artistName: { type: String, required: true },
  frameSize: { type: String, required: true },
  colorPalette: { type: [String], required: true },
  artType: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Art', artSchema);
