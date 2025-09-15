const mongoose = require("mongoose");

const crewRequestSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "eventModel", required: true },
  requestedBy: { type: String, required: true },
  crewType: { 
    type: String, 
    required: true,
    enum: ["sound", "lighting", "stage_setup", "security", "catering", "photography", "transportation", "other"]
  },
  crewDetails: { type: String, required: true },
  requiredDate: { type: Date, required: true },
  requiredTime: { type: String, required: true },
  estimatedDuration: { type: String, required: true },
  specialRequirements: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: String, default: null },
  adminNotes: { type: String, default: "" }
});

module.exports = mongoose.model("crewrequest", crewRequestSchema);
