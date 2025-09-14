const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testimonialsSchema = new Schema({
  description: { type: String, required: true }
});

module.exports = mongoose.model("Testimonial", testimonialsSchema);