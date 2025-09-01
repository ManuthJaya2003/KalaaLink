const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  eventVenue: { type: String, required: true },
  eventDescription: { type: String },
  image: { type: String, default: "" },
  priceCustomer: { type: Number, required: true, min: 0 },
  registrationFeeArtist: { type: Number, required: true, min: 0 },
  maxArtists: { type: Number, required: true, min: 1, default: 10 },
  maxCustomers: { type: Number, required: true, min: 1, default: 50 },
  crewRequest: { type: mongoose.Schema.Types.ObjectId, ref: "crewrequest", default: null },
});

module.exports = mongoose.model("eventModel", eventSchema);
