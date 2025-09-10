import React from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Main navbar integration - using main project navigation for consistency
import MainNav from '../../MainNav/MainNav';
import './DonationCancel.css';

function DonationCancel() {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/mainhome');
  };

  const handleTryAgain = () => {
    navigate('/donordashboard');
  };

  return (
    <div className="donation-cancel-container">
      {/* ✅ Main navbar integration - ensures consistent navigation across all subsystems */}
      <MainNav />
      
      <div className="cancel-content">
        <div className="cancel-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>

        <h1 className="cancel-title">Donation Cancelled</h1>
        
        <div className="cancel-message">
          <p>
            Your donation process was cancelled. No payment has been processed.
          </p>
          <p>
            If you encountered any issues during the payment process, please try again 
            or contact our support team for assistance.
          </p>
        </div>

        <div className="action-buttons">
          <button onClick={handleReturnHome} className="btn-secondary">
            Return to Home
          </button>
          <button onClick={handleTryAgain} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default DonationCancel;
