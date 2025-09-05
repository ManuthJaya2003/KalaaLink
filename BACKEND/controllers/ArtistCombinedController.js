const Artist = require("../model/ArtistModel");
const ArtistManager = require("../model/ArtistManagerModel");

const getAllApprovedArtists = async (req, res) => {
  try {
    // Fetch approved self-registered artists
    const selfArtists = await Artist.find({ isApproved: true }).select(
      "firstName lastName stageName bio profileImage coverImage bookingPrice portfolioItems genre category summary"
    );

    // Fetch approved manager-added artists
    const managerArtists = await ArtistManager.find({ approved: true }).select(
      "artistName genre category summary bio image bookingPrice"
    );

    // Normalize fields so React can handle them in the same way
    const normalizedSelfArtists = selfArtists.map((artist) => ({
      _id: artist._id,
      artistName: artist.stageName,
      genre: artist.genre || "Not provided",
      category: artist.category || "Not provided",
      summary: artist.summary || "Not provided",
      bio: artist.bio,
      bookingPrice: artist.bookingPrice,
      image: artist.profileImage,
      portfolioItems: artist.portfolioItems,
      isSelfRegistered: true,
    }));

    const normalizedManagerArtists = managerArtists.map((artist) => ({
      _id: artist._id,
      artistName: artist.artistName,
      genre: artist.genre,
      category: artist.category,
      summary: artist.summary,
      bio: artist.bio,
      bookingPrice: artist.bookingPrice,
      image: artist.image,
      isSelfRegistered: false,
    }));

    const combinedArtists = [...normalizedSelfArtists, ...normalizedManagerArtists];

    return res.status(200).json(combinedArtists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllApprovedArtists };
