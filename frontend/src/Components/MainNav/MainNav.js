import React from "react";
import "./MainNav.css";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../Common/LanguageSelector";

function MainNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className={`navbar-item navbar-brand ${isActive('/') ? 'active' : ''}`}>
          <Link to="/">
            <div className="brand-container">
              <img 
                src="/logo.png" 
                alt="KalaaLink Logo" 
                className="logo-icon"
              />
              <h1 className="brand-title">KalaaLink</h1>
            </div>
          </Link>
        </li>
        <li className={`navbar-item ${isActive('/artists') ? 'active' : ''}`}>
          <Link to = "/artists">
          <h1>{t('artists')}</h1>
          </Link>
        </li>
        <li className={`navbar-item ${isActive('/Events') ? 'active' : ''}`}>
          <Link to="/Events">
            <h1>{t('events')}</h1>
          </Link>
        </li>
        <li className={`navbar-item ${isActive('/marketplace') ? 'active' : ''}`}>
          <Link to="/marketplace">
            <h1>{t('marketplace')}</h1>
          </Link>
        </li>
        <li className={`navbar-item ${isActive('/donordashboard') ? 'active' : ''}`}>
          <Link to="/donordashboard">
            <h1>{t('donations')}</h1>
          </Link>
        </li>
        <li className={`navbar-item ${isActive('/contactus') ? 'active' : ''}`}>
          <Link to="/contactus">
            <h1>{t('contactUs')}</h1>
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/cart" aria-label={t('cart')} title={t('cart')} className="cart-link">
            <svg className="cart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.25 2.25h1.386c.345 0 .648.235.728.566l.356 1.423 1.55 6.241a1.5 1.5 0 001.455 1.125h7.8a1.5 1.5 0 001.455-1.125l1.381-5.523a.75.75 0 00-.728-.927H4.665" />
              <path d="M16.5 16.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8.25 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
            </svg>
          </Link>
        </li>
        
        {/* Language Selector */}
        <li className="navbar-item">
          <LanguageSelector />
        </li>
        
        {/* Theme Toggle Button */}
        <li className="navbar-item">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <svg className="theme-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="theme-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </li>
        
        {/* Authentication Section */}
        {isAuthenticated ? (
          <>
            {/* Profile Icon */}
            <li className="navbar-item">
              <Link to="/profile" aria-label={t('profile')} title={t('profile')} className="profile-link">
                <svg className="profile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </li>
            {/* Sign Out */}
            <li className="navbar-item auth-item">
              <button onClick={handleLogout} className="logout-btn">
                <h1>{t('signOut')}</h1>
              </button>
            </li>
          </>
        ) : (
          <>
            {/* Login */}
            <li className="navbar-item auth-item">
              <Link to = "/login">
              <h1>{t('login')}</h1>
              </Link>
            </li>
            {/* Sign Up */}
            <li className="navbar-item auth-item">
              <Link to = "/signup">
              <h1>{t('signUp')}</h1>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default MainNav;
