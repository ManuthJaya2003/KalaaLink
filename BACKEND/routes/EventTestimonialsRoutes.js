const express = require("express");
const router = express.Router();
const {
  createTestimonial,
  getEventTestimonials,
  getAllTestimonials,
  deleteTestimonial,
  getTestimonialStats
} = require("../controllers/EventTestimonialsController");

// Create testimonial for a specific event
router.post("/events/:eventId/testimonials", createTestimonial);

// Get all testimonials for a specific event
router.get("/events/:eventId/testimonials", getEventTestimonials);

// Get testimonial statistics for a specific event
router.get("/events/:eventId/testimonials/stats", getTestimonialStats);

// Get all testimonials (for admin dashboard)
router.get("/testimonials", getAllTestimonials);

// Delete a testimonial
router.delete("/testimonials/:id", deleteTestimonial);

module.exports = router;
