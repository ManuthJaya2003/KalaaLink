const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventTestimonialsSchema = new Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "eventModel", 
    required: true 
  },
  customerName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for better query performance
eventTestimonialsSchema.index({ eventId: 1, createdAt: -1 });

module.exports = mongoose.model("EventTestimonials", eventTestimonialsSchema);
