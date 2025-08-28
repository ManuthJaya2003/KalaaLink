const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // <-- loads .env file into process.env


// Routes
const artistManagerRoute = require("./routes/ArtistMangerRoute");
const registeredArtistRoute = require("./routes/ArtistRoute");
const userRoute = require("./routes/UserRoute");
const eventRoute = require("./routes/eventRoute");
const employeeRoute = require("./routes/EmployeeRoute");
const artistBookingRoute = require("./routes/ArtistBookingRoutes"); // ✅ NEW Booking routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Mount routes
app.use("/artists", artistManagerRoute);              // Artist Manager CRUD & applications
app.use("/registeredArtists", registeredArtistRoute); // Self-registered artists
app.use("/users", userRoute);                         // User CRUD
app.use("/events", eventRoute);                       // Event CRUD
app.use("/api/employees", employeeRoute);             // Employee CRUD
app.use("/bookings", artistBookingRoute);             // ✅ Artist Bookings (Customer, Artist, Manager)

// MongoDB Connection
mongoose
  .connect("mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/")
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
