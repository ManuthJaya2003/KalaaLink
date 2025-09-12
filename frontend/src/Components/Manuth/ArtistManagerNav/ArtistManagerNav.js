import React from "react";
import "./ArtistManagerNav.css";
import { Link } from "react-router-dom";

function ArtistManagerNav() {
  return (
    <nav className="artist-navbar">
      <div className="artist-navbar-container">
        <ul className="artist-navbar-list">
          <li className="artist-navbar-item">
            <Link to="/overview" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span className="artist-navbar-text">Overview</span>
            </Link>
          </li>
          <li className="artist-navbar-item">
            <Link to="/applications" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              <span className="artist-navbar-text">Applications</span>
            </Link>
          </li>
          <li className="artist-navbar-item">
            <Link to="/manage_artists" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="artist-navbar-text">Manage Artists</span>
            </Link>
          </li>
          <li className="artist-navbar-item">
            <Link to="/artist_reviews" className="artist-navbar-link">
              <svg className="artist-navbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M13 8H7"></path>
                <path d="M17 12H7"></path>
              </svg>
              <span className="artist-navbar-text">Artist Reviews</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default ArtistManagerNav;
