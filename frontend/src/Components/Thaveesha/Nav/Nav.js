// File: Components/Nav/Nav.js
import React from 'react';
import './nav.css';
import { Link } from "react-router-dom";

function Nav() {
  return (
    <div>
      <ul className="home-ul">
        <li className="home-ll"><Link to="/artist" className="home-a"><h1>Artist</h1></Link></li>
        <li className="home-ll"><Link to="/events" className="home-a"><h1>Events</h1></Link></li>
        <li className="home-ll"><Link to="/marketplace" className="home-a"><h1>Marketplace</h1></Link></li>
        <li className="home-ll"><Link to="/donations" className="home-a"><h1>Donations</h1></Link></li>
        <li className="home-ll"><Link to="/contactus" className="home-a"><h1>ContactUs</h1></Link></li>
        <li className="home-ll"><Link to="/cart" className="home-a"><h1>Cart</h1></Link></li>
        <li className="home-ll"><Link to="/login" className="home-a"><h1>Login</h1></Link></li>
        <li className="home-ll"><Link to="/signup" className="home-a"><h1>Sign Up</h1></Link></li>
        <li className="home-ll"><Link to="/admin-dashboard" className="home-a"><h1>Admin Dashboard</h1></Link></li>
      </ul>
    </div>
  );
}

export default Nav;
