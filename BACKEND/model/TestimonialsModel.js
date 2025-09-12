const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testimonialsSchema = new Schema({
  // Legacy field for backward compatibility
  description: { type: String },
  
  // New fields for event testimonials
  attendeeName: { type: String, required: true },
  eventId: { type: String, required: true },
  eventTitle: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  feedback: { type: String, required: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("Testimonial", testimonialsSchema);