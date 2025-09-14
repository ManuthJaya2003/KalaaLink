const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArtistManagerSchema = new Schema({
    artistName: { type: String, required: true },
    genre: { type: String, required: true },
    category: { type: String, required: true },
    bookingPrice: { type: Number, required: true },
    summary: { type: String, required: true },
    bio: { type: String, required: true },
    image: { type: String, required: false },
    approved: { type: Boolean, default: false } // NEW: tracks approval
}, {
    timestamps: true
});

module.exports = mongoose.model("ArtistManagerModel", ArtistManagerSchema);
