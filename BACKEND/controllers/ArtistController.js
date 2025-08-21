const Artist = require("../model/ArtistModel");

// Register new artist
const registerArtist = async (req, res) => {
  const { firstName, lastName, email, stageName, bio, password } = req.body;

  try {
    const existingArtist = await Artist.findOne({ email });
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
      isApproved: false, // default
      status: "pending", // default
    });

    await artist.save();
    return res.status(201).json({ message: "Artist registered successfully. Awaiting approval.", artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login artist (only if approved)
const loginArtist = async (req, res) => {
  const { email, password } = req.body;

  try {
    const artist = await Artist.findOne({ email });
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    // Password check
    if (artist.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Only allow login if artist is approved
    if (!artist.isApproved) {
      return res.status(403).json({ message: "Artist not approved yet" });
    }

    return res.status(200).json({
      message: "Login successful",
      artist: {
        id: artist._id,
        firstName: artist.firstName,
        lastName: artist.lastName,
        stageName: artist.stageName,
        email: artist.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get artist profile
const getArtistProfile = async (req, res) => {
  const artist_id = req.params.artist_id;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    // Only approved artists can fetch their profile
    if (!artist.isApproved) {
      return res.status(403).json({ message: "Artist not approved yet" });
    }

    return res.status(200).json({ artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update artist profile
const updateArtistProfile = async (req, res) => {
  const artist_id = req.params.artist_id;
  const { firstName, lastName, stageName, bio, password } = req.body;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    if (!artist.isApproved) {
      return res.status(403).json({ message: "Artist not approved yet" });
    }

    artist.firstName = firstName || artist.firstName;
    artist.lastName = lastName || artist.lastName;
    artist.stageName = stageName || artist.stageName;
    artist.bio = bio || artist.bio;
    artist.password = password || artist.password;

    await artist.save();
    return res.status(200).json({ message: "Profile updated successfully", artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete artist profile
const deleteArtistProfile = async (req, res) => {
  const artist_id = req.params.artist_id;

  try {
    const artist = await Artist.findByIdAndDelete(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    return res.status(200).json({ message: "Artist profile deleted successfully", artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  registerArtist,
  loginArtist,
  getArtistProfile,
  updateArtistProfile,
  deleteArtistProfile,
};
