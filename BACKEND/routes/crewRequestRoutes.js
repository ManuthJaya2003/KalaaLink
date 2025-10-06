const express = require("express");
const router = express.Router();
const {
  getAllCrewRequests,
  getCrewRequestById,
  getCrewRequestsByEventId,
  createCrewRequest,
  updateCrewRequestStatus,
  updateCrewRequest,
  deleteCrewRequest,
  getCrewRequestsByStatus,
  getCrewRequestsByManager
} = require("../controllers/CrewRequestController");

// Get all crew requests
router.get("/", getAllCrewRequests);

// Get crew requests by manager (must be before /:id route)
router.get("/manager", getCrewRequestsByManager);

// Get crew requests by event ID
router.get("/event/:eventId", getCrewRequestsByEventId);

// Get crew requests by status
router.get("/status/:status", getCrewRequestsByStatus);

// Get crew request by ID (must be last to avoid conflicts)
router.get("/:id", getCrewRequestById);

// Create new crew request
router.post("/", createCrewRequest);

// Update crew request status (approve/reject)
router.patch("/:id/status", updateCrewRequestStatus);

// Update crew request details
router.put("/:id", updateCrewRequest);

// Delete crew request
router.delete("/:id", deleteCrewRequest);

module.exports = router;
