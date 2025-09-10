const express = require("express");
const router = express.Router();

const DonorController = require("../Controllers/DonorControllers");

// ✅ Basic CRUD operations
router.get("/", DonorController.getAllDonors);
router.post("/", DonorController.addDonors);

// ✅ Enhanced donation system routes (must come before /:id routes)
router.put("/payment-status/:id", DonorController.updatePaymentStatus);
router.get("/status/:status", DonorController.getDonationsByStatus);
router.get("/analytics/summary", DonorController.getDonationAnalytics);

// ✅ Debug route to test bulk delete endpoint
router.get("/test-bulk-delete", (req, res) => {
  res.json({ message: "Bulk delete endpoint is accessible", timestamp: new Date() });
});

router.delete("/bulk-delete/:status", DonorController.bulkDeleteDonationsByStatus);

// ✅ Individual CRUD operations (must come after specific routes)
router.get("/:id", DonorController.getById);
router.put("/:id", DonorController.updateDonors);
router.delete("/:id", DonorController.deleteDonors);

module.exports = router;