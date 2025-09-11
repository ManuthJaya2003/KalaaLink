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
        // Get artists from ArtistRegistration collection (direct registrations)
        const directRegistrations = await ArtistRegistration.find({ event: eventId });
        
        // Get event to check registeredArtists array (from Stripe webhook)
        const event = await Event.findById(eventId).populate('registeredArtists', 'firstName lastName email stageName');
        
        // Combine both sources
        let allArtists = [...directRegistrations];
        
        // Add artists from event.registeredArtists (Stripe webhook registrations)
        if (event && event.registeredArtists && event.registeredArtists.length > 0) {
            const webhookRegistrations = event.registeredArtists
                .filter(artist => artist && artist._id) // Filter out null/undefined artists
                .map(artist => ({
                    _id: artist._id,
                    event: eventId,
                    artistName: artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown Artist',
                    artistEmail: artist.email || 'unknown@example.com',
                    registrationFee: event.registrationFeeArtist,
                    registrationDate: new Date(), // Webhook registrations don't have a specific date
                    source: 'webhook'
                }));
            allArtists = [...allArtists, ...webhookRegistrations];
        }
        
        // Remove duplicates based on email
        const uniqueArtists = allArtists.filter((artist, index, self) => 
            index === self.findIndex(a => a.artistEmail === artist.artistEmail)
        );
        
        // Return empty array instead of 404 when no artists found
        return res.status(200).json({ artists: uniqueArtists || [] });
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
