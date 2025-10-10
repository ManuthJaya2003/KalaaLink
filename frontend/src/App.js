// File: App.js
import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";
import employeeHeartbeat from "./utils/employeeHeartbeat";

// CSS
import "./App.css";

// Existing App components
import Home from "./Components/Home/Home.js";
import ArtistManagerDashboard from "./Components/Manuth/ArtistManagerDashboard/ArtistManagerDashboard.js";
import ManageArtists from "./Components/Manuth/ManageArtists/ManageArtists.js";
import AddArtist from "./Components/Manuth/AddArtist/AddArtist.js";
import Artists from "./Components/Artists/Artists.js";
import UpdateArtist from "./Components/Manuth/UpdateArtist/UpdateArtist.js";
import Applications from "./Components/Manuth/Applications/Applications.js";
import SignUp from "./Components/SignUp/SignUp.js";
import Overview from "./Components/Manuth/Overview/Overview.js";
import ArtistRegistration from "./Components/Manuth/ArtistRegistration/ArtistRegistration.js";
import Login from "./Components/Login/Login.js";
import ProfessionalLogin from "./Components/Manuth/ProfessionalLogin/ProfessionalLogin.js";
import AdminDashboard from "./Components/Thaveesha/AdminDashboard/AdminDashboard.js";
import PayrollManagement from "./Components/Thaveesha/AdminDashboard/Payroll/PayrollManagement";
import EventManagerDashboard from "./Components/Lihini/EventManagerDashboard/EventManagerDashboard.js";
import ArtistLogin from "./Components/Manuth/ArtistLogin/ArtistLogin.js";
import ArtistPortfolio from "./Components/Manuth/ArtistPortfolio/ArtistPortfolio.js";
import ArtistDashboard from "./Components/Manuth/ArtistDashboard/ArtistDashboard.js";
import ArtistEditProfile from "./Components/Manuth/ArtistEditProfile/ArtistEditProfile.js";
import BookArtist from "./Components/Manuth/BookArtist/BookArtist.js";
import ArtistEvents from "./Components/Manuth/ArtistDashboard/Events.js";
import ArtistReviews from "./Components/Manuth/ArtistReviews/ArtistReviews.js";
import ArtistDashboardReviews from "./Components/Manuth/ArtistDashboard/ArtistDashboardReviews.js";

// Subsystem components
import Events from "./Components/Lihini/Events/Events.js";
import EventUpdate from "./Components/Lihini/EventUpdate/EventUpdate";
import EventPage from "./Components/Lihini/Event/EventPage";
import SuccessPage from "./Components/Lihini/Events/SuccessPage.js";
import CancelPage from "./Components/Lihini/Events/CancelPage.js";

// ✅ New component from your smaller App.js
import ContactUs from "./Components/Thaveesha/ContactUs/ContactUs";
import ComplaintDashBoard from "./Components/Thaveesha/ContactUs/ComplaintDashBoard";
import EmployeeManagement from "./Components/Thaveesha/EmployeeManagement/EmployeeManagement";

// ✅ Marketplace components
import Marketplace from "./Components/Diwya/Marketplace/Marketplace";
import MarketplaceManagerDashboard from "./Components/Diwya/MarketplaceManagerDashboard/MarketplaceManagerDashboard";
import CartPage from "./Components/Diwya/Cartpage/Cartpage";
import CustomizationDetails from "./Components/Diwya/CustomizationDetails/CustomizationDetails";
import OrderConfirmation from "./Components/Diwya/OrderConfirmation/OrderConfirmation";
import Payment from "./Components/Diwya/Payment/Payment";
import ProductReviews from "./Components/Diwya/ProductReviews/ProductReviews";
import { CartProvider } from "./Components/Diwya/CartContext/CartContext";

// ✅ Booking Success/Cancelled Pages
import BookingSuccessPage from "./Components/Common/BookingSuccessPage";
import BookingCancelledPage from "./Components/Common/BookingCancelledPage";

// ✅ Donation Management Components
import AddPackages from "./Components/Chamodi/AddPackages/AddPackages";
import Packages from "./Components/Chamodi/PackageDetails/Packages";
import UpdatePackages from "./Components/Chamodi/UpdatePackages/UpdatePackages";
import DonorDashboard from "./Components/Chamodi/DonorDashboard/DonorDashboard";
import DonorPackageDetails from "./Components/Chamodi/DonorPackageDetails/DonorPackageDetails";
import DonationManagerDashboard from "./Components/Chamodi/DonationManagerDashboard/DonationManagerDashboard";
import DonationSuccess from "./Components/Chamodi/DonationSuccess/DonationSuccess";
import DonationCancel from "./Components/Chamodi/DonationCancel/DonationCancel";

// ✅ Authentication Context
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// ✅ Profile and Forgot Password Components
import Profile from "./Components/Profile/Profile";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";

const URL = "http://localhost:5000/events";

function App() {
  const [events, setEvents] = useState([]);

  // Handle page unload/refresh to cleanup employee status
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Stop heartbeat when page is being unloaded
      employeeHeartbeat.stop();
    };

    const handleVisibilityChange = () => {
      // Stop heartbeat when tab becomes hidden (user switches tabs)
      if (document.hidden) {
        employeeHeartbeat.stop();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    console.log("App.js: Fetching events from:", URL);
    axios
      .get(URL)
      .then((res) => {
        console.log("App.js: Events fetched successfully:", res.data);
        setEvents(res.data);
      })
      .catch((err) => {
        console.error("App.js: Failed to fetch events:", err);
        setEvents([]); // Set empty array on error
      });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div>
          <Routes>
          {/* ---------- Redirects ---------- */}
          <Route path="/" element={<Navigate to="/mainhome" replace />} />

          {/* ---------- Home ---------- */}
          <Route path="/mainhome" element={<Home />} />

          {/* ---------- Artists ---------- */}
          <Route path="/artists" element={<Artists />} />

          {/* ---------- Artist Manager ---------- */}
          <Route path="/artistManager" element={<ArtistManagerDashboard />} />
          <Route path="/manage_artists" element={<ManageArtists />} />
          <Route path="/manage_artists/:artist_id" element={<UpdateArtist />} />
          <Route path="/addArtist" element={<AddArtist />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/register" element={<ArtistRegistration />} />
          <Route path="/artist_login" element={<ArtistLogin />} />
          <Route path="/artist_reviews" element={<ArtistReviews />} />

          {/* ---------- SignUp/Login ---------- */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/professional_login" element={<ProfessionalLogin />} />

          {/* ---------- Profile ---------- */}
          <Route path="/profile" element={<Profile />} />

          {/* ---------- Admin ---------- */}
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/admindashboard/payroll" element={<AdminDashboard />} />

          {/* ---------- Event Manager (Subsystem) ---------- */}
          <Route path="/events" element={<Events events={events} />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route
            path="/eventManagerDash"
            element={<EventManagerDashboard events={events} setEvents={setEvents} />}
          />
          <Route
            path="/eventManagerDash/:id"
            element={<EventUpdate events={events} setEvents={setEvents} />}
          />

          {/* ---------- Artist ---------- */}
          <Route path="/portfolio" element={<ArtistPortfolio />} />
          <Route path="/artistdashboard" element={<ArtistDashboard />} />
          <Route path="/artist/editprofile" element={<ArtistEditProfile />} />
          <Route path="/artist/events" element={<ArtistEvents />} />
          <Route path="/artist-dashboard-reviews" element={<ArtistDashboardReviews />} />

          {/* ---------- Book Artist ---------- */}
          <Route path="/bookArtist" element={<BookArtist />} />

          {/* ---------- ContactUs ---------- */}
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/complaints" element={<ComplaintDashBoard />} />
          <Route path="/employee-management" element={<EmployeeManagement />} />

          {/* ---------- Marketplace ---------- */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace-manager-dashboard" element={<MarketplaceManagerDashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/customizationdetails" element={<CustomizationDetails />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/product-reviews" element={<ProductReviews />} />

          {/* ---------- Stripe Payment Routes ---------- */}
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />

          {/* ---------- Booking Success/Cancelled Routes ---------- */}
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/booking-cancelled" element={<BookingCancelledPage />} />

          {/* ✅ Donation Management Routes */}
          <Route path="/donation-manager-dashboard" element={<DonationManagerDashboard />} />
          <Route path="/addpackages" element={<AddPackages />} />
          <Route path="/packagedetails" element={<Packages />} />
          <Route path="/updatepackage/:id" element={<UpdatePackages />} />
          <Route path="/donordashboard" element={<DonorDashboard />} />
          <Route path="/donorpackagedetails" element={<DonorPackageDetails />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
          <Route path="/donation-cancel" element={<DonationCancel />} />

          {/* ---------- 404 ---------- */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
