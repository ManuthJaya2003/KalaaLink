const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const donationPackageSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ["Bronze", "Silver", "Gold", "Custom"],
  },
  amount: {
    type: Number,
    required: true,
    min: 10, // Minimum amount as per the custom donation minimum
  },
});

const campaignSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  goal: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  packages: [donationPackageSchema], // Array of donation packages
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Campaign", campaignSchema);