const mongoose = require('mongoose');

// Get Testimonial model safely
const getTestimonialModel = () => {
  if (mongoose.models.Testimonial) {
    return mongoose.models.Testimonial;
  }
  return require("../Model/TestimonialsModel");
};

const getAllTestimonials = async (req, res, next) => {
  let testimonials;
  try {
    const Testimonial = getTestimonialModel();
    testimonials = await Testimonial.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching testimonials" });
  }
  if (!testimonials || testimonials.length === 0) {
    return res.status(404).json({ message: "No testimonials found" });
  }
  return res.status(200).json({ testimonials });
};

const createTestimonial = async (req, res, next) => {
  const { description } = req.body;
  try {
    const Testimonial = getTestimonialModel();
    const newTestimonial = new Testimonial({
      description,
    });
    await newTestimonial.save();
    return res.status(201).json({ message: "Testimonial created successfully", testimonial: newTestimonial });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to add testimonial" });
  }
};

exports.getAllTestimonials = getAllTestimonials;
exports.createTestimonial = createTestimonial;