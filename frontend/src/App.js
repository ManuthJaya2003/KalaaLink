// File: App.js
import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";

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
import EventManagerDashboard from "./Components/Lihini/EventManagerDashboard/EventManagerDashboard.js";
import ArtistLogin from "./Components/Manuth/ArtistLogin/ArtistLogin.js";
import ArtistPortfolio from "./Components/Manuth/ArtistPortfolio/ArtistPortfolio.js";
import ArtistDashboard from "./Components/Manuth/ArtistDashboard/ArtistDashboard.js";
import ArtistEditProfile from "./Components/Manuth/ArtistEditProfile/ArtistEditProfile.js";
import BookArtist from "./Components/Manuth/BookArtist/BookArtist.js";
import ArtistEvents from "./Components/Manuth/ArtistDashboard/Events.js";

// Subsystem components
import Events from "./Components/Lihini/Events/Events.js";
import EventUpdate from "./Components/Lihini/EventUpdate/EventUpdate";
import EventPage from "./Components/Lihini/Event/EventPage";
import SuccessPage from "./Components/Lihini/Events/SuccessPage.js";
import CancelPage from "./Components/Lihini/Events/CancelPage.js";

// ✅ New component from your smaller App.js
import ContactUs from "./Components/Thaveesha/ContactUs/ContactUs";
import ComplaintDashBoard from "./Components/Thaveesha/ContactUs/ComplaintDashBoard";

// ✅ Marketplace components
import Marketplace from "./Components/Diwya/Marketplace/Marketplace";
import MarketplaceManagerDashboard from "./Components/Diwya/MarketplaceManagerDashboard/MarketplaceManagerDashboard";
import CartPage from "./Components/Diwya/Cartpage/Cartpage";
import CustomizationDetails from "./Components/Diwya/CustomizationDetails/CustomizationDetails";
import OrderConfirmation from "./Components/Diwya/OrderConfirmation/OrderConfirmation";
import Payment from "./Components/Diwya/Payment/Payment";
import ProductReviews from "./Components/Diwya/ProductReviews/ProductReviews";
import { CartProvider } from "./Components/Diwya/CartContext/CartContext";

const URL = "http://localhost:5000/events";

function App() {
  const [events, setEvents] = useState([]);

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

        {/* ---------- SignUp/Login ---------- */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/professional_login" element={<ProfessionalLogin />} />

        {/* ---------- Admin ---------- */}
        <Route path="/admindashboard" element={<AdminDashboard />} />

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

        {/* ---------- Book Artist ---------- */}
        <Route path="/bookArtist" element={<BookArtist />} />

        {/* ---------- ContactUs ---------- */}
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/complaints" element={<ComplaintDashBoard />} />

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

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </div>
    </CartProvider>
  );
}

export default App;
