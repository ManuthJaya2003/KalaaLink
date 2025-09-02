const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load env variables

const app = express();

// ================== Middleware ==================
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
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

// ✅ New Complaints Route
const complaintsRoute = require("./routes/ComplaintsRoutes");

// Mount routes (keeping original prefixes)
app.use("/artists", artistManagerRoute);              
app.use("/registeredArtists", registeredArtistRoute); 
app.use("/users", userRoute);                         
app.use("/events", eventRoute);                       
app.use("/api/employees", employeeRoute);             
app.use("/bookings", artistBookingRoute);             
app.use("/eventBookings", bookingRoutes);             
app.use("/artistsEventRegistration", artistRegistrationRoutes); 
app.use("/complaints", complaintsRoute);              

// ================== Database ==================
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/"
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

// ================== Error Handling ==================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});
