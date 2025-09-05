const mongoose = require("mongoose");
const Artist = require("../model/ArtistModel");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/"
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
    fixImagePaths();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

async function fixImagePaths() {
  try {
    console.log("🔍 Searching for artists with incorrect image paths...");
    
    // Find artists with paths that start with "/uploads/"
    const artistsWithIncorrectPaths = await Artist.find({
      $or: [
        { profileImage: { $regex: "^/uploads/" } },
        { coverImage: { $regex: "^/uploads/" } }
      ]
    });

    console.log(`📊 Found ${artistsWithIncorrectPaths.length} artists with incorrect image paths`);

    if (artistsWithIncorrectPaths.length === 0) {
      console.log("✅ No artists need path correction");
      process.exit(0);
    }

    // Fix each artist
    for (const artist of artistsWithIncorrectPaths) {
      let updated = false;
      
      if (artist.profileImage && artist.profileImage.startsWith("/uploads/")) {
        // Remove "/uploads/" prefix to get just the filename
        artist.profileImage = artist.profileImage.replace("/uploads/", "");
        updated = true;
        console.log(`🔧 Fixed profileImage for ${artist.stageName}: ${artist.profileImage}`);
      }
      
      if (artist.coverImage && artist.coverImage.startsWith("/uploads/")) {
        // Remove "/uploads/" prefix to get just the filename
        artist.coverImage = artist.coverImage.replace("/uploads/", "");
        updated = true;
        console.log(`🔧 Fixed coverImage for ${artist.stageName}: ${artist.coverImage}`);
      }

      if (updated) {
        await artist.save();
        console.log(`✅ Updated artist: ${artist.stageName}`);
      }
    }

    console.log("🎉 Migration completed successfully!");
    console.log(`📈 Fixed ${artistsWithIncorrectPaths.length} artists`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}
