const Artist = require("../model/ArtistModel");
const path = require("path");
const fs = require("fs");

// ---------------------- Existing functions ----------------------

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
      isApproved: false,
      status: "pending",
    });

    await artist.save();
    return res.status(201).json({
      message: "Artist registered successfully. Awaiting approval.",
      artist,
    });
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

    if (artist.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

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
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    return res.status(200).json({ artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update artist profile info (name, stageName, bio, password, bookingPrice)
const updateArtistProfile = async (req, res) => {
  const artist_id = req.params.artist_id;
  const { firstName, lastName, stageName, bio, password, bookingPrice } = req.body;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    artist.firstName = firstName || artist.firstName;
    artist.lastName = lastName || artist.lastName;
    artist.stageName = stageName || artist.stageName;
    artist.bio = bio || artist.bio;
    artist.password = password || artist.password;

    // 🔑 new line to handle bookingPrice
    if (bookingPrice !== undefined) {
      artist.bookingPrice = bookingPrice;
    }

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

// ---------------------- Dashboard / Portfolio Functions ----------------------

// Update profile & cover images (Multer + local folder)
const updateArtistImages = async (req, res) => {
  const artist_id = req.params.artist_id;
  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    if (req.files?.profileImage) {
      const profilePath = path.join("uploads", req.files.profileImage[0].filename);
      artist.profileImage = "/" + profilePath.replace(/\\/g, "/");
    }

    if (req.files?.coverImage) {
      const coverPath = path.join("uploads", req.files.coverImage[0].filename);
      artist.coverImage = "/" + coverPath.replace(/\\/g, "/");
    }

    await artist.save();
    return res.status(200).json({ message: "Images updated successfully", artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update social links
const updateSocialLinks = async (req, res) => {
  const artist_id = req.params.artist_id;
  const { instagram, facebook, youtube, tiktok } = req.body;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    artist.socialLinks.instagram = instagram || artist.socialLinks.instagram;
    artist.socialLinks.facebook = facebook || artist.socialLinks.facebook;
    artist.socialLinks.youtube = youtube || artist.socialLinks.youtube;
    artist.socialLinks.tiktok = tiktok || artist.socialLinks.tiktok;

    await artist.save();
    return res.status(200).json({ message: "Social links updated", artist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add portfolio item (Multer + local folder)
const addPortfolioItem = async (req, res) => {
  const artist_id = req.params.artist_id;
  const { type, description } = req.body;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    let url = "";
    if (req.file) {
      url = "/" + path.join("uploads", req.file.filename).replace(/\\/g, "/");
    }

    const newItem = { type, url, description };
    artist.portfolioItems.push(newItem);
    await artist.save();

    return res.status(201).json({ message: "Portfolio item added", portfolioItems: artist.portfolioItems });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete portfolio item by index
const deletePortfolioItem = async (req, res) => {
  const artist_id = req.params.artist_id;
  const { itemIndex } = req.body;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    artist.portfolioItems.splice(itemIndex, 1);
    await artist.save();

    return res.status(200).json({ message: "Portfolio item deleted", portfolioItems: artist.portfolioItems });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get bookings
const getArtistBookings = async (req, res) => {
  const artist_id = req.params.artist_id;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    return res.status(200).json({ bookings: artist.bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update booking status (accept/reject)
const updateBookingStatus = async (req, res) => {
  const artist_id = req.params.artist_id;
  const { bookingId, status } = req.body;

  try {
    const artist = await Artist.findById(artist_id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    if (!artist.isApproved) return res.status(403).json({ message: "Artist not approved yet" });

    const booking = artist.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await artist.save();

    return res.status(200).json({ message: "Booking updated", bookings: artist.bookings });
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
  updateArtistImages,
  updateSocialLinks,
  addPortfolioItem,
  deletePortfolioItem,
  getArtistBookings,
  updateBookingStatus,
};
