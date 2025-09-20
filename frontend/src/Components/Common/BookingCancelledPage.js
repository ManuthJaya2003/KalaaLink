import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainNav from "../MainNav/MainNav";
import "./BookingCancelledPage.css";

function BookingCancelledPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const bookingId = urlParams.get('bookingId');

  const handleTryAgain = () => {
    if (bookingId) {
      navigate(`/book-artist?bookingId=${bookingId}`);
    } else {
      navigate('/artists');
    }
  };

  const handleBrowseArtists = () => {
    navigate('/artists');
  };

  return (
    <div className="cancelled-page">
      <MainNav />
      
      <div className="cancelled-container">
        <div className="cancelled-content">
          {/* Cancelled Header */}
          <div className="cancelled-header">
            <div className="cancelled-icon">❌</div>
            <h1 className="cancelled-title">Booking Cancelled</h1>
            <p className="cancelled-subtitle">
              Your payment was cancelled. No charges have been made to your account.
            </p>
          </div>

          {/* Booking Info */}
          {bookingId && (
            <div className="booking-info">
              <p><strong>Booking ID:</strong> {bookingId}</p>
              <p>You can try booking again anytime.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleTryAgain}>
              <span className="btn-icon">🔄</span>
              Try Again
            </button>
            
            <button className="btn-secondary" onClick={handleBrowseArtists}>
              <span className="btn-icon">🎨</span>
              Browse Artists
            </button>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <h4>Need Help?</h4>
            <p>If you're experiencing issues with payment, please:</p>
            <ul>
              <li>Check your payment method details</li>
              <li>Ensure you have sufficient funds</li>
              <li>Try a different payment method</li>
              <li>Contact support if problems persist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingCancelledPage;
