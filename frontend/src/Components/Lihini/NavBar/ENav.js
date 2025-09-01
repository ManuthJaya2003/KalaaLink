import React from 'react'
import './ENav.css';
import {Link} from "react-router-dom";



function ENav() {
  return (
    <div>
      <ul className="Home-ul">
        <li className="Home-ll">
            <Link to="/mainhome" className="active home-a">
            <h1>Home</h1></Link>
        </li>
         <li className="Home-ll">
              <Link to="/Events" className="active home-a">
              <h1>Events</h1></Link>
        </li>
         <li className="Home-ll">
              <Link to="/mainhome" className="active home-a"></Link>
            <h1>Marketplace</h1>
        </li>
         <li className="Home-ll">
              <Link to="/mainhome" className="active home-a"></Link>
            <h1>Donate</h1>
        </li>
         <li className="Home-ll">
              <Link to="/mainhome" className="active home-a"></Link>
            <h1>Contact us</h1>
        </li>
         <li className="Home-ll">
              <Link to="/mainhome" className="active home-a"></Link>
            <h1>cart</h1>
        </li>
         <li className="Home-ll">
              <Link to="/mainhome" className="active home-a"></Link>
            <h1>login</h1>
        </li>
         <li className="Home-ll">
              <Link to="/mainhome" className="active home-a"></Link>
            <h1>sign up</h1>
        </li>
         <li className="Home-ll">
              <Link to="/EventManagerDash" className="active home-a">
              <h1>Event manager dashboard</h1></Link>
            
        </li>
      </ul>
    </div>
  )
}

export default ENav
