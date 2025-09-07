const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const donorSchema = new Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: Number,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Amount: {
    type: Number,
    required: true,
  },
  DonorNote: {
    type: String,
    required: false, // Optional field
  },
});

module.exports = mongoose.model("Donor", donorSchema);