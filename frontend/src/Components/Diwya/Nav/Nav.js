import React from 'react'
import'./nav.css';
import { Link } from 'react-router-dom';

function Nav() {
  return (
    <div>
        <ul className="home-ul">
            <li className ="home-ll">
                <Link to ="/mainHome" className="active home-a">
                <h3>Market place</h3>
                </Link>
            </li>
            <li className ="home-ll">
                <Link to ="/addproduct" className="active home-a">
                <h3>Add Product</h3>
                </Link>
            </li>
            <li className ="home-ll">
                <Link to ="/productdetails" className="active home-a">
                <h3>Product Details</h3>
                </Link>
            </li>
            
        
        </ul>
      
    </div>
  )
}

export default Nav
