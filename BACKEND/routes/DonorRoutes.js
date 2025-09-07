const express = require("express");
const router = express.Router();

const Donor = require("../Model/DonorModel");
const DonorController = require("../Controllers/DonorControllers");

router.get("/", DonorController.getAllDonors);
router.post("/", DonorController.addDonors);
router.get("/:id", DonorController.getById);
router.put("/:id", DonorController.updateDonors);
router.delete("/:id", DonorController.deleteDonors);

module.exports = router;