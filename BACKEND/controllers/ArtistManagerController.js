const ArtistManager = require("../model/ArtistManagerModel");
const Artist = require("../model/ArtistModel"); // For artist approval integration

// Get all artists (manager + approved self-registered)
const getAllArtists = async (req, res) => {
  try {
    // Fetch manager-added artists
    const managerArtists = await ArtistManager.find();
    // Fetch approved self-registered artists
    const approvedArtists = await Artist.find({ status: "approved" }).select(
      "firstName lastName stageName bio profileImage coverImage bookingPrice genre category summary"
    );

    // Normalize manager artists
    const normalizedManagerArtists = managerArtists.map(a => ({
      _id: a._id,
      artistName: a.artistName, // manager's artist name
      genre: a.genre,
      category: a.category,
      bookingPrice: a.bookingPrice,
      summary: a.summary,
      bio: a.bio,
      image: a.image || "", // cover image
      profilePic: a.profilePic || "", // profile picture
    }));

    // Normalize self-registered artists
    const normalizedSelfArtists = approvedArtists.map(a => ({
      _id: a._id,
      artistName: a.stageName, // self-registered stage name
      genre: a.genre || "Not provided",
      category: a.category || "Not provided",
      bookingPrice: a.bookingPrice,
      summary: a.summary || "Not provided",
      bio: a.bio,
      image: a.coverImage || "", // cover image
      profilePic: a.profileImage || "", // profile picture
    }));

    // Merge both arrays
    const allArtists = [...normalizedManagerArtists, ...normalizedSelfArtists];

    if (allArtists.length === 0) {
      return res.status(404).json({ message: "No artists found" });
    }

    return res.status(200).json(allArtists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Add new artist under Artist Manager
const addArtists = async (req, res) => {
  const { artistName, genre, category, bookingPrice, summary, bio } = req.body;
  
  // Handle cover image
  const image = req.files?.image ? req.files.image[0].filename : null;
  // Handle profile picture
  const profilePic = req.files?.profilePic ? req.files.profilePic[0].filename : null;

  try {
    const artist = new ArtistManager({
      artistName,
      genre,
      category,
      bookingPrice,
      summary,
      bio,
      image,
      profilePic,
      approved: true, // added by manager directly
    });

    await artist.save();
    return res.status(201).json(artist);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add artist" });
  }
};

// Get artist by ID
const getArtistByID = async (req, res) => {
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

// Update artist details
const updateArtist = async (req, res) => {
  const artist_id = req.params.artist_id;
  const { artistName, genre, category, bookingPrice, summary, bio } = req.body;
  
  // Handle cover image
  const image = req.files?.image ? req.files.image[0].filename : req.body.image;
  // Handle profile picture
  const profilePic = req.files?.profilePic ? req.files.profilePic[0].filename : req.body.profilePic;

  try {
    const updateData = { artistName, genre, category, bookingPrice, summary, bio };
    if (image) updateData.image = image;
    if (profilePic) updateData.profilePic = profilePic;

    const artist = await ArtistManager.findByIdAndUpdate(
      artist_id,
      updateData,
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
const deleteArtist = async (req, res) => {
  const artist_id = req.params.artist_id;
  try {
    const artist = await ArtistManager.findByIdAndDelete(artist_id);
    if (!artist) return res.status(404).json({ message: "Unable to delete artist" });
    return res.status(200).json({ artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all artist applications
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
    artist.isApproved = true; // ✅ important for frontend login
    await artist.save();

    return res.status(200).json({ message: "Artist approved successfully", artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Reject an artist
const rejectArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    artist.status = "rejected";
    artist.isApproved = false;
    await artist.save();

    return res.status(200).json({ message: "Artist rejected successfully", artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Get all distinct genres
const getGenres = async (req, res) => {
  try {
    // Get genres from manager artists
    const managerGenres = await ArtistManager.distinct("genre");
    // Get genres from approved self-registered artists
    const selfGenres = await Artist.distinct("genre", { status: "approved" });
    
    // Combine and remove duplicates
    const allGenres = [...new Set([...managerGenres, ...selfGenres])].filter(genre => genre && genre.trim() !== "");
    
    return res.status(200).json(allGenres);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all distinct categories for a given genre
const getCategoriesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    
    if (!genre) {
      return res.status(400).json({ message: "Genre parameter is required" });
    }
    
    // Get categories from manager artists for the given genre
    const managerCategories = await ArtistManager.distinct("category", { genre: genre });
    // Get categories from approved self-registered artists for the given genre
    const selfCategories = await Artist.distinct("category", { genre: genre, status: "approved" });
    
    // Combine and remove duplicates
    const allCategories = [...new Set([...managerCategories, ...selfCategories])].filter(category => category && category.trim() !== "");
    
    return res.status(200).json(allCategories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
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
  rejectArtist,
  getGenres,
  getCategoriesByGenre,
};
