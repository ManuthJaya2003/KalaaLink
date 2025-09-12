const mongoose = require('mongoose');

// Get Testimonial model safely
const getTestimonialModel = () => {
  if (mongoose.models.Testimonial) {
    return mongoose.models.Testimonial;
  }
  return require("../model/TestimonialsModel");
};

const getAllTestimonials = async (req, res, next) => {
  let testimonials;
  try {
    const Testimonial = getTestimonialModel();
    testimonials = await Testimonial.find().sort({ createdAt: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching testimonials" });
  }
  if (!testimonials || testimonials.length === 0) {
    return res.status(404).json({ message: "No testimonials found" });
  }
  return res.status(200).json({ testimonials });
};

const getTestimonialsByEvent = async (req, res, next) => {
  const { eventId } = req.params;
  let testimonials;
  try {
    const Testimonial = getTestimonialModel();
    testimonials = await Testimonial.find({ eventId }).sort({ createdAt: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching testimonials for event" });
  }
  return res.status(200).json({ testimonials });
};

const createTestimonial = async (req, res, next) => {
  const { attendeeName, eventId, eventTitle, rating, feedback, description } = req.body;
  
  try {
    const Testimonial = getTestimonialModel();
    
    // Support both new event testimonials and legacy testimonials
    const testimonialData = {
      attendeeName,
      eventId,
      eventTitle,
      rating,
      feedback,
      description // Legacy support
    };
    
    // Remove undefined fields
    Object.keys(testimonialData).forEach(key => {
      if (testimonialData[key] === undefined) {
        delete testimonialData[key];
      }
    });
    
    const newTestimonial = new Testimonial(testimonialData);
    await newTestimonial.save();
    return res.status(201).json({ 
      message: "Testimonial created successfully", 
      testimonial: newTestimonial 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to add testimonial" });
  }
};

const deleteTestimonial = async (req, res, next) => {
  const { id } = req.params;
  try {
    const Testimonial = getTestimonialModel();
    const testimonial = await Testimonial.findByIdAndDelete(id);
    
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    
    return res.status(200).json({ 
      message: "Testimonial deleted successfully",
      testimonial 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to delete testimonial" });
  }
};

exports.getAllTestimonials = getAllTestimonials;
exports.getTestimonialsByEvent = getTestimonialsByEvent;
exports.createTestimonial = createTestimonial;
exports.deleteTestimonial = deleteTestimonial;