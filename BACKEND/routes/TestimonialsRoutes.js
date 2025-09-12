const express = require("express");
const router = express.Router();

const TestimonialsController = require("../controllers/TestimonialsControllers");

// Get all testimonials
router.get("/", TestimonialsController.getAllTestimonials);

// Get testimonials for a specific event
router.get("/:eventId", TestimonialsController.getTestimonialsByEvent);

// Create a new testimonial
router.post("/", TestimonialsController.createTestimonial);

// Delete a testimonial
router.delete("/:id", TestimonialsController.deleteTestimonial);

module.exports = router;