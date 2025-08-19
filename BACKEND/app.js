const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const artistManagerRoute = require("./routes/ArtistMangerRoute");
const registeredArtistRoute = require("./routes/ArtistRoute");
const userRoute = require("./routes/UserRoute");
const path = require("path");
const router = require("./routes/eventRoute")

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Mount routes
app.use("/artists", artistManagerRoute);       // Artist Manager CRUD & applications
app.use("/registeredArtists", registeredArtistRoute); // Self-registered artists
app.use("/users", userRoute);                  // User CRUD
app.use("/events",router);

// Connect to MongoDB and start server
mongoose.connect("mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/")
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

// ✅ Start server regardless of DB connection
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});