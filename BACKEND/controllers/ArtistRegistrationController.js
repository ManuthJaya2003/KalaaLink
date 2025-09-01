const ArtistRegistration = require("../model/artistRegistration");
const Event = require("../model/eventModel");

// Register artist for an event
const registerArtist = async (req, res, next) => {
    try {
        const { eventId, artistName, artistEmail } = req.body; // remove registrationFee from req.body

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check maxArtists
        const existingRegistrations = await ArtistRegistration.countDocuments({ event: eventId });
        if (existingRegistrations >= event.maxArtists) {
            return res.status(400).json({ message: "Artist registration full for this event" });
        }

        // Use the registration fee defined by the admin in the event
        const artist = new ArtistRegistration({
            event: eventId,
            artistName,
            artistEmail,
            registrationFee: event.registrationFeeArtist // enforce admin-defined fee
        });

        const savedArtist = await artist.save();
        return res.status(201).json({ message: "Artist registered successfully", artist: savedArtist });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to register artist", error: err.message });
    }
};

// Get all artists for an event
const getArtistsByEvent = async (req, res, next) => {
    const eventId = req.params.id;
    try {
        const artists = await ArtistRegistration.find({ event: eventId });
        if (!artists || artists.length === 0) {
            return res.status(404).json({ message: "No artists found" });
        }
        return res.status(200).json({ artists });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch artists", error: err.message });
    }
};

// Delete artist registration
const deleteArtist = async (req, res, next) => {
    const artistId = req.params.id;
    try {
        const artist = await ArtistRegistration.findByIdAndDelete(artistId);
        if (!artist) {
            return res.status(404).json({ message: "Artist not found" });
        }
        return res.status(200).json({ message: "Artist registration deleted", artist });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete artist", error: err.message });
    }
};

module.exports = {
    registerArtist,
    getArtistsByEvent,
    deleteArtist
};
