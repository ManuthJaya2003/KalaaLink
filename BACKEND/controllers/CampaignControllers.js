const Campaign = require("../Model/CampaignModel");

const getAllCampaigns = async (req, res, next) => {
  let campaigns;
  try {
    campaigns = await Campaign.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching campaigns" });
  }
  if (!campaigns) {
    return res.status(404).json({ message: "Campaigns not found" });
  }
  return res.status(200).json({ campaigns });
};

const addCampaign = async (req, res, next) => {
  const { name, goal, description, packages } = req.body;
  let campaign;
  try {
    campaign = new Campaign({ name, goal, description, packages });
    await campaign.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
  if (!campaign) {
    return res.status(404).json({ message: "Unable to create campaign" });
  }
  return res.status(200).json({ campaign });
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  let campaign;
  try {
    campaign = await Campaign.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching campaign" });
  }
  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }
  return res.status(200).json({ campaign });
};

const updateCampaign = async (req, res, next) => {
  const id = req.params.id;
  const { name, goal, description, packages } = req.body;
  let campaign;
  try {
    campaign = await Campaign.findByIdAndUpdate(
      id,
      { name, goal, description, packages },
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating campaign" });
  }
  if (!campaign) {
    return res.status(404).json({ message: "Unable to update campaign" });
  }
  return res.status(200).json({ campaign });
};

const deleteCampaign = async (req, res, next) => {
  const id = req.params.id;
  let campaign;
  try {
    campaign = await Campaign.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting campaign" });
  }
  if (!campaign) {
    return res.status(404).json({ message: "Unable to delete campaign" });
  }
  return res.status(200).json({ campaign });
};

exports.getAllCampaigns = getAllCampaigns;
exports.addCampaign = addCampaign;
exports.getById = getById;
exports.updateCampaign = updateCampaign;
exports.deleteCampaign = deleteCampaign;