import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainNav from "../../MainNav/MainNav";
import "../Event/Event.css";

function CancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");

  const handleTryAgain = () => {
    navigate("/lihini/events");
  };

  const handleContactSupport = () => {
    alert("Please contact our support team at support@kalaalink.com or call +94 11 123 4567");
  };

  return (
    <div>
      <MainNav />
      <div className="cancelled-container">
        <div className="cancelled-card">
          <div className="cancelled-icon">❌</div>
          <h1 className="cancelled-title">Payment Cancelled</h1>
          <p className="cancelled-subtitle">
            Your payment was not completed. Your booking is still pending and you can try again.
          </p>

          {bookingId && (
            <div className="booking-info">
              <p>
                <strong>Booking ID:</strong> {bookingId}
              </p>
              <p>
                If you have any questions about this booking, please contact our support team.
              </p>
            </div>
          )}

          <div className="cancelled-actions">
            <button onClick={handleTryAgain} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={handleContactSupport} className="btn btn-secondary">
              Contact Support
            </button>
          </div>

          <div className="cancelled-info">
            <h3>What happened?</h3>
            <ul>
              <li>You may have closed the payment window</li>
              <li>There might have been a technical issue</li>
              <li>Your payment method may have been declined</li>
            </ul>
            
            <h3>What you can do:</h3>
            <ul>
              <li>Try booking again with a different payment method</li>
              <li>Contact our support team for assistance</li>
              <li>Check if your bank/card provider is blocking the transaction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CancelPage;
