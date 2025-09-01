const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArtistRegistrationSchema = new Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "eventModel", required: true },
    artistName: { type: String, required: true },
    artistEmail: { type: String, required: true },
    registrationFee: { type: Number, required: true },
    registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ArtistRegistration", ArtistRegistrationSchema);
