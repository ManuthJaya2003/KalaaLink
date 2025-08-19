const Artist = require("../model/ArtistModel");

// Register new artist
const registerArtist = async (req, res, next) => {
    const { firstName, lastName, email, stageName, bio, password } = req.body;

    // Check if artist already exists
    let existingArtist;
    try {
        existingArtist = await Artist.findOne({ email });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    if (existingArtist) {
        return res.status(400).json({ message: "Artist already exists" });
    }

    const artist = new Artist({
        firstName,
        lastName,
        email,
        stageName,
        bio,
        password,
        isApproved: false // default
    });

    try {
        await artist.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to register artist" });
    }

    return res.status(201).json({ message: "Artist registered successfully. Awaiting approval.", artist });
};

// Get artist profile (only if approved)
const getArtistProfile = async (req, res, next) => {
    const artist_id = req.params.artist_id;

    try {
        const artist = await Artist.findById(artist_id);
        if (!artist) return res.status(404).json({ message: "Artist not found" });
        if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

        return res.status(200).json({ artist });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update artist profile (only if approved)
const updateArtistProfile = async (req, res, next) => {
    const artist_id = req.params.artist_id;
    const { firstName, lastName, stageName, bio, password } = req.body;

    try {
        const artist = await Artist.findById(artist_id);
        if (!artist) return res.status(404).json({ message: "Artist not found" });
        if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

        // Update fields
        artist.firstName = firstName || artist.firstName;
        artist.lastName = lastName || artist.lastName;
        artist.stageName = stageName || artist.stageName;
        artist.bio = bio || artist.bio;
        artist.password = password || artist.password;

        await artist.save();
        return res.status(200).json({ message: "Profile updated successfully", artist });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete self-registered artist profile
const deleteArtistProfile = async (req, res, next) => {
    const artist_id = req.params.artist_id;

    try {
        const artist = await Artist.findByIdAndDelete(artist_id);

        if (!artist) {
            return res.status(404).json({ message: "Artist not found" });
        }

        return res.status(200).json({ message: "Artist profile deleted successfully", artist });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    registerArtist,
    getArtistProfile,
    updateArtistProfile,
    deleteArtistProfile
};
