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
  createRegistrationCheckoutSession,
  registerArtistForEvent,
  getArtistRegistrations,
  handleEventRegistrationWebhook,
  getSessionDetails,
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
router.post("/create-registration-checkout-session", createRegistrationCheckoutSession);
router.post("/register-artist", registerArtistForEvent);
router.get("/artist/:artistId/registrations", getArtistRegistrations);
router.get("/session/:sessionId", getSessionDetails);

// Stripe webhook for event registrations
router.post("/webhook", handleEventRegistrationWebhook);

module.exports = router;
