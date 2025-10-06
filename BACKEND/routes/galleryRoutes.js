const express = require("express");
const router = express.Router();
const {
  getAllGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
  getEventsForDropdown,
  upload
} = require("../controllers/galleryController");

// Get all gallery images
router.get("/", getAllGalleryImages);

// Get events for dropdown
router.get("/events", getEventsForDropdown);

// Add new gallery image
router.post("/", upload.single("image"), addGalleryImage);

// Delete gallery image
router.delete("/:id", deleteGalleryImage);

module.exports = router;
