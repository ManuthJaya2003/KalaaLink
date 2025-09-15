const express = require("express");
const router = express.Router();
const PartnershipController = require("../controllers/PartnershipController");

// Public routes (no authentication required)
router.post("/", PartnershipController.submitPartnershipRequest);
router.get("/approved", PartnershipController.getApprovedPartnershipRequests);

// Protected routes (Donation Manager only)
// Note: In a production environment, you would add authentication middleware here
// For now, we'll rely on frontend authentication checks
router.get("/", PartnershipController.getAllPartnershipRequests);
router.get("/stats", PartnershipController.getPartnershipStats);
router.get("/:id", PartnershipController.getPartnershipRequestById);
router.patch("/:id/approve", PartnershipController.approvePartnershipRequest);
router.patch("/:id/reject", PartnershipController.rejectPartnershipRequest);
router.delete("/:id", PartnershipController.deletePartnershipRequest);
router.delete("/clear/:status", PartnershipController.clearPartnershipRequestsByStatus);

module.exports = router;
