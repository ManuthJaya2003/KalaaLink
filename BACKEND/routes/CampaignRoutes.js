const express = require("express");
const router = express.Router();

const Campaign = require("../Model/CampaignModel");
const CampaignController = require("../Controllers/CampaignControllers");

router.get("/", CampaignController.getAllCampaigns);
router.post("/", CampaignController.addCampaign);
router.get("/:id", CampaignController.getById);
router.put("/:id", CampaignController.updateCampaign);
router.delete("/:id", CampaignController.deleteCampaign);

module.exports = router;