const express = require("express");
const router = express.Router();
const upload = require("../uploads/upload"); // multer setup
const {
  createEvent,
  getAllEvents,
  getByEventId,
  updateEvent,
  deleteEvent,
  requestCrew,
} = require("../controllers/eventController");

// Event CRUD
router.post("/create", upload.single("image"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getByEventId);
router.put("/:id", upload.single("image"), updateEvent);
router.delete("/:id", deleteEvent);

// Request crew manually
router.post("/request-crew", requestCrew);

module.exports = router;
