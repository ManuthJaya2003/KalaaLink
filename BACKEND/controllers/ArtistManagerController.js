const ArtistManager = require("../model/ArtistManagerModel");
const Artist = require("../model/ArtistModel"); // For artist approval integration


// Get all artists
const getAllArtists = async (req, res, next) => {
  try {
    const artists = await ArtistManager.find();
    if (!artists || artists.length === 0) {
      return res.status(404).json({ message: "Artists not found" });
    }
    return res.status(200).json(artists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Insert data with multer image handling
const addArtists = async (req, res, next) => {
  const { artistName, genre, category, bookingPrice, summary, bio } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const artist = new ArtistManager({
      artistName,
      genre,
      category,
      bookingPrice,
      summary,
      bio,
      image,
      approved: true // Added by manager directly
    });

    await artist.save();
    return res.status(201).json(artist);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add artist" });
  }
};

// Get artist by ID
const getArtistByID = async (req, res, next) => {
  const artist_id = req.params.artist_id;
  try {
    const artist = await ArtistManager.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    return res.status(200).json({ artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update artist details with optional image upload
const updateArtist = async (req, res, next) => {
  const artist_id = req.params.artist_id;
  const { artistName, genre, category, bookingPrice, summary, bio } = req.body;
  const image = req.file ? req.file.filename : req.body.image; // Keep old image if no new uploaded file

  try {
    const artist = await ArtistManager.findByIdAndUpdate(
      artist_id,
      { artistName, genre, category, bookingPrice, summary, bio, image },
      { new: true }
    );

    if (!artist) return res.status(404).json({ message: "Unable to update artist details" });
    return res.status(200).json(artist);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete artist
const deleteArtist = async (req, res, next) => {
  const artist_id = req.params.artist_id;
  try {
    const artist = await ArtistManager.findByIdAndDelete(artist_id);
    if (!artist) return res.status(404).json({ message: "Unable to delete artist details" });
    return res.status(200).json({ artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const pending = await Artist.find({ status: "pending" });
    const approved = await Artist.find({ status: "approved" });
    const rejected = await Artist.find({ status: "rejected" });

    return res.status(200).json({ pending, approved, rejected });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Approve an artist
const approveArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    artist.status = "approved";
    await artist.save();

    res.status(200).json({ message: "Artist approved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject an artist
const rejectArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    artist.status = "rejected";
    await artist.save();

    res.status(200).json({ message: "Artist rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = {
  getAllArtists,
  addArtists,
  getArtistByID,
  updateArtist,
  deleteArtist,
  getAllApplications,
  approveArtist,
  rejectArtist
};
