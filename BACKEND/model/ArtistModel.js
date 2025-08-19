const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const artistSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    stageName: { type: String, required: true },
    bio: { type: String, required: true },
    password: { type: String, required: true }, // plain for now
    isApproved: { type: Boolean, default: false }, // Must be approved by Artist Manager
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", artistSchema);
