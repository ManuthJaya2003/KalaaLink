import React from "react";
import { Link } from "react-router-dom";
import "./MainFooter.css";

function MainFooter() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section about">
            <h2>KalaaLink</h2>
            <p>
              KalaaLink is a platform for artists to showcase their talent, connect
              with clients, participate in events, and manage their creative careers.
            </p>
          </div>

          {/* Navigation Section */}
          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/artists">Artists</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/marketplace">Marketplace</Link></li>
              <li><Link to="/donations">Donations</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-section contact">
            <h3>Contact Us</h3>
            <p>Email: support@kalaalink.com</p>
            <p>Phone: +94 77 123 4567</p>
            <p>Address: Colombo, Sri Lanka</p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FB</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">IG</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">TW</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} KalaaLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default MainFooter;
