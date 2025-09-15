const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { startCleanupScheduler } = require("./utils/employeeCleanup");
require("dotenv").config(); // Load env variables

const app = express();

// ================== Middleware ==================
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Raw body for Stripe webhooks
app.use("/eventBookings/webhook", express.raw({ type: "application/json" }));
app.use("/bookings/webhook", express.raw({ type: "application/json" }));
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use("/events/webhook", express.raw({ type: "application/json" }));
app.use("/api/donations/webhook", express.raw({ type: "application/json" }));

// JSON body for other routes with increased size limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Ensure Uploads dir exists for Marketplace Manager
const uploadsDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/Uploads", express.static(uploadsDir));

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

// ✅ New Complaints & Dashboard
const complaintsRoute = require("./routes/ComplaintsRoutes");
const dashboardRoute = require("./routes/dashboardRoutes");

// ✅ Marketplace Manager Routes
const artRoutes = require("./routes/artRoutes");
const customizationRoutes = require("./routes/customizationRoutes");
const reviewRoutes = require("./routes/reviewsRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const orderRoutes = require("./routes/orderRoutes");

// ✅ Donation Management Routes (from subsystem)
const donorRouter = require("./routes/DonorRoutes");
const packageRouter = require("./routes/PackageRoutes");
const campaignRouter = require("./routes/CampaignRoutes");
const testimonialsRouter = require("./routes/TestimonialsRoutes");
const donationPaymentRouter = require("./routes/DonationPaymentRoutes");
const impactStoryRouter = require("./routes/ImpactStoryRoutes");

// ✅ Authentication Routes
const authRoutes = require("./routes/authRoutes");

// ✅ Location Tracking Routes
const locationRoutes = require("./routes/locationRoutes");

// ✅ Event Testimonials Routes
const eventTestimonialsRoutes = require("./routes/EventTestimonialsRoutes");

// ✅ Crew Request Routes
const crewRequestRoutes = require("./routes/crewRequestRoutes");

// ✅ Artist Review Routes
const artistReviewRoutes = require("./routes/ArtistReviewRoutes");

// ✅ Partnership Routes
const partnershipRoutes = require("./routes/PartnershipRoutes");

// Mount routes
app.use("/artists", artistManagerRoute);
app.use("/registeredArtists", registeredArtistRoute);
app.use("/users", userRoute);
app.use("/events", eventRoute);
app.use("/api/employees", employeeRoute);
app.use("/bookings", artistBookingRoute);
app.use("/eventBookings", bookingRoutes);
app.use("/artistsEventRegistration", artistRegistrationRoutes);
app.use("/complaints", complaintsRoute);
app.use("/api/dashboard", dashboardRoute);

// Marketplace Manager routes
app.use("/api/art", artRoutes);
app.use("/api/customizations", customizationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Donation Management routes
app.use("/donor", donorRouter);
app.use("/package", packageRouter);
app.use("/campaign", campaignRouter);
app.use("/testimonials", testimonialsRouter);
app.use("/api/donations", donationPaymentRouter);
app.use("/api/impactStories", impactStoryRouter);

// ✅ Authentication routes
app.use("/api/auth", authRoutes);

// ✅ Location tracking routes
app.use("/api/location", locationRoutes);

// ✅ Event testimonials routes
app.use("/api", eventTestimonialsRoutes);

// ✅ Crew request routes
app.use("/api/crew-requests", crewRequestRoutes);

// ✅ Artist review routes
app.use("/api/artist-reviews", artistReviewRoutes);

// ✅ Partnership routes
app.use("/api/partnerships", partnershipRoutes);

// ================== PDF Generation Route ==================
app.get("/api/art/:id/report", async (req, res) => {
  try {
    const Art = require("./models/Art");
    const Review = require("./models/Review");

    const art = await Art.findById(req.params.id);
    if (!art) return res.status(404).json({ message: "Art not found" });

    const reviews = await Review.find({ productId: req.params.id });

    const doc = new PDFDocument();
    const fontPath = path.join(__dirname, "fonts", "Roboto-Regular.ttf");
    if (fs.existsSync(fontPath)) doc.font(fontPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=art-report-${art._id}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(20).text("Art Details", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Art Type: ${art.artType}`);
    doc.text(`Size: ${art.size}`);
    doc.text(`Artist Name: ${art.artistName}`);
    doc.text(`Frame Size: ${art.frameSize}`);
    doc.text(
      `Color Palette: ${
        Array.isArray(art.colorPalette)
          ? art.colorPalette.join(", ")
          : art.colorPalette
      }`
    );
    doc.text(`Price: LKR ${art.price}`);
    doc.text(
      `Created At: ${new Date(art.createdAt).toLocaleString("en-US", {
        timeZone: "Asia/Colombo",
      })}`
    );

    doc.moveDown();
    doc.fontSize(16).text("Customer Reviews");
    if (reviews.length > 0) {
      reviews.forEach((review, index) => {
        doc.moveDown();
        doc.fontSize(12).text(`Review ${index + 1}:`);
        doc.text(`Customer: ${review.customerName}`);
        doc.text(`Rating: ${review.rating} Stars`);
        doc.text(`Comment: ${review.comment}`);
        doc.text(
          `Date: ${new Date(review.createdAt).toLocaleString("en-US", {
            timeZone: "Asia/Colombo",
          })}`
        );
      });
    } else {
      doc.moveDown();
      doc.fontSize(12).text("No reviews yet");
    }

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error.message);
    res
      .status(500)
      .json({ message: "Error generating PDF", error: error.message });
  }
});

// ================== Database ==================
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/"
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // ✅ Preload all models to prevent OverwriteModelError
    require("./model/DonorModel");
    require("./model/PackageModel");
    require("./model/UserModel");
    require("./model/EmployeeModel");
    require("./model/ArtistModel");
    require("./model/Booking");
    require("./model/eventModel");
    require("./model/Art");
    require("./model/Review");
    require("./model/Order");
    require("./model/Customization");
    require("./model/Delivery");
    require("./model/CampaignModel");
    require("./model/TestimonialsModel");
    require("./model/EventTestimonials");
    require("./model/ComplaintsModel");
    require("./model/ImpactStory");
    require("./model/crewrequest");
    require("./model/ArtistReview");
    require("./Model/PartnershipRequest");

    console.log("✅ All models loaded successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
      startCleanupScheduler();
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
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});
