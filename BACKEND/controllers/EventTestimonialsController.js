const EventTestimonials = require("../model/EventTestimonials");
const eventModel = require("../model/eventModel");
const mongoose = require("mongoose");

// Create a new testimonial for an event
const createTestimonial = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { customerName, rating, message } = req.body;

    // Validate required fields
    if (!customerName || !rating || !message) {
      return res.status(400).json({
        success: false,
        message: "Customer name, rating, and message are required"
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Create testimonial
    const testimonial = new EventTestimonials({
      eventId,
      customerName: customerName.trim(),
      rating: parseInt(rating),
      message: message.trim()
    });

    await testimonial.save();

    // Populate event details for response
    await testimonial.populate('eventId', 'eventTitle eventDate eventVenue');

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: testimonial
    });

  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all testimonials for a specific event
const getEventTestimonials = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Get testimonials for the event, sorted by newest first
    const testimonials = await EventTestimonials.find({ eventId })
      .sort({ createdAt: -1 })
      .populate('eventId', 'eventTitle eventDate eventVenue');

    res.status(200).json({
      success: true,
      message: "Testimonials retrieved successfully",
      data: testimonials
    });

  } catch (error) {
    console.error("Error fetching event testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all testimonials (for admin dashboard)
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await EventTestimonials.find()
      .sort({ createdAt: -1 })
      .populate('eventId', 'eventTitle eventDate eventVenue');

    res.status(200).json({
      success: true,
      message: "All testimonials retrieved successfully",
      data: testimonials
    });

  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete a testimonial
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await EventTestimonials.findByIdAndDelete(id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get testimonial statistics for an event
const getTestimonialStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const stats = await EventTestimonials.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: null,
          totalTestimonials: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No testimonials found for this event",
        data: {
          totalTestimonials: 0,
          averageRating: 0,
          ratingDistribution: []
        }
      });
    }

    const result = stats[0];
    const ratingCounts = result.ratingDistribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: "Testimonial statistics retrieved successfully",
      data: {
        totalTestimonials: result.totalTestimonials,
        averageRating: Math.round(result.averageRating * 10) / 10,
        ratingDistribution: ratingCounts
      }
    });

  } catch (error) {
    console.error("Error fetching testimonial statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  createTestimonial,
  getEventTestimonials,
  getAllTestimonials,
  deleteTestimonial,
  getTestimonialStats
};
