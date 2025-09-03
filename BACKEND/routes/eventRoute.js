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
  createRegistrationPayment,
  registerArtistForEvent,
  getArtistRegistrations,
} = require("../controllers/eventController");

// Event CRUD
router.post("/create", upload.single("image"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getByEventId);
router.put("/:id", upload.single("image"), updateEvent);
router.delete("/:id", deleteEvent);

// Request crew manually
router.post("/request-crew", requestCrew);

// Artist event registration
router.post("/create-registration-payment", createRegistrationPayment);
router.post("/register-artist", registerArtistForEvent);
router.get("/artist/:artistId/registrations", getArtistRegistrations);

module.exports = router;
