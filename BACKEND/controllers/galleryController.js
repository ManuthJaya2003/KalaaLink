const GalleryImage = require("../model/GalleryImage");
const eventModel = require("../model/eventModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/gallery");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "gallery-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed"));
    }
  }
});

// Get all gallery images
const getAllGalleryImages = async (req, res) => {
  try {
    const images = await GalleryImage.find()
      .populate('associatedEventId', 'eventTitle')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gallery images",
      error: error.message
    });
  }
};

// Add new gallery image
const addGalleryImage = async (req, res) => {
  try {
    const { altText, associatedEventId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    if (!altText || altText.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Alt text is required"
      });
    }

    // Validate associated event if provided
    if (associatedEventId && associatedEventId !== "") {
      const event = await eventModel.findById(associatedEventId);
      if (!event) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID"
        });
      }
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    
    const newImage = new GalleryImage({
      imageUrl,
      altText: altText.trim(),
      associatedEventId: associatedEventId && associatedEventId !== "" ? associatedEventId : null
    });

    const savedImage = await newImage.save();
    await savedImage.populate('associatedEventId', 'eventTitle');

    res.status(201).json({
      success: true,
      message: "Gallery image added successfully",
      data: savedImage
    });
  } catch (error) {
    console.error("Error adding gallery image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add gallery image",
      error: error.message
    });
  }
};

// Delete gallery image
const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await GalleryImage.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found"
      });
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, "..", image.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await GalleryImage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
      error: error.message
    });
  }
};

// Get all events for dropdown
const getEventsForDropdown = async (req, res) => {
  try {
    const events = await eventModel.find({}, 'eventTitle eventDate')
      .sort({ eventDate: -1 });
    
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message
    });
  }
};

module.exports = {
  getAllGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
  getEventsForDropdown,
  upload
};
