import React from "react";
import "./ArtistNav.css";
import { Link } from "react-router-dom";

function ArtistNav() {
  return (
    <nav className="artist-navbar">
      <div className="artist-navbar-container">
        <ul className="artist-navbar-list">
          {/* Dashboard Tab */}
          <li className="artist-navbar-item">
            <Link to="/artistdashboard" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span className="artist-navbar-text">Dashboard</span>
            </Link>
          </li>

          {/* Portfolio Tab */}
          <li className="artist-navbar-item">
            <Link to="/portfolio" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8"></path>
                <rect x="3" y="16" width="18" height="6" rx="2" ry="2"></rect>
              </svg>
              <span className="artist-navbar-text">Portfolio</span>
            </Link>
          </li>

          {/* Events Tab */}
          <li className="artist-navbar-item">
            <Link to="/artist/events" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="artist-navbar-text">Events</span>
            </Link>
          </li>

          {/* Reviews Tab */}
          <li className="artist-navbar-item">
            <Link to="/artist-dashboard-reviews" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
              </svg>
              <span className="artist-navbar-text">Reviews</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default ArtistNav;
