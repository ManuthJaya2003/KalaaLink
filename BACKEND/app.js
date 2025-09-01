const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load env variables

const app = express();

// ================== Middleware ==================
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================== Routes ==================
// Existing KalaaLink Routes
const artistManagerRoute = require("./routes/ArtistMangerRoute");
const registeredArtistRoute = require("./routes/ArtistRoute");
const userRoute = require("./routes/UserRoute");
const eventRoute = require("./routes/eventRoute");
const employeeRoute = require("./routes/EmployeeRoute");
const artistBookingRoute = require("./routes/ArtistBookingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const artistRegistrationRoutes = require("./routes/artistRegistrationRoutes");

// Mount routes
app.use("/artists", artistManagerRoute);              // Artist Manager CRUD & applications
app.use("/registeredArtists", registeredArtistRoute); // Self-registered artists
app.use("/users", userRoute);                         // User CRUD
app.use("/events", eventRoute);                       // Event CRUD
app.use("/api/employees", employeeRoute);             // Employee CRUD
app.use("/bookings", artistBookingRoute);             // Artist Bookings (main subsystem)
app.use("/eventBookings", bookingRoutes);                  // ✅ Subsystem Bookings (same prefix)
app.use("/artistsEventRegistration", artistRegistrationRoutes);        // ✅ Subsystem Artists (same prefix)

// ================== Database ==================
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/"
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

// ================== Server ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
