import React from "react";
import "./MainNav.css";
import { Link } from "react-router-dom";

function MainNav() {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item navbar-brand">
          <Link to="/">
            <h1 className="brand-title">KalaaLink</h1>
          </Link>
        </li>
        <li className="navbar-item">
          <Link to = "/artists">
          <h1>Artists</h1>
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/Events">
            <h1>Events</h1>
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/marketplace">
            <h1>Marketplace</h1>
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/donordashboard">
            <h1>Donations</h1>
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/contactus">
            <h1>Contact Us</h1>
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/cart" aria-label="Cart" title="Cart" className="cart-link">
            <svg className="cart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.25 2.25h1.386c.345 0 .648.235.728.566l.356 1.423 1.55 6.241a1.5 1.5 0 001.455 1.125h7.8a1.5 1.5 0 001.455-1.125l1.381-5.523a.75.75 0 00-.728-.927H4.665" />
              <path d="M16.5 16.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8.25 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
            </svg>
          </Link>
        </li>
        <li className="navbar-item auth-item">
          <Link to = "/login">
          <h1>Login</h1>
          </Link>
        </li>
        <li className="navbar-item auth-item">
          <Link to = "/signup">
          <h1>SignUp</h1>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default MainNav;
