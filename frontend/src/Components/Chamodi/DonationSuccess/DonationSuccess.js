import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// ✅ Main navbar integration - using main project navigation for consistency
import MainNav from '../../MainNav/MainNav';
import DonationAcknowledgment from '../DonationAcknowledgment/DonationAcknowledgment';
import axios from 'axios';
import './DonationSuccess.css';

function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setError('No session ID found');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      // ✅ First verify the payment status
      const response = await axios.get(`http://localhost:5000/api/donations/verify/${sessionId}`);
      setDonation(response.data);
      
      // ✅ Automatically update payment status to 'paid' when user reaches success page
      if (response.data.paymentStatus === 'pending') {
        console.log('🔄 Updating payment status to paid...');
        try {
          await axios.put(`http://localhost:5000/api/donations/update-status/${sessionId}`, {
            status: 'paid'
          });
          console.log('✅ Payment status updated to paid');
          
          // Update local state to reflect the change
          setDonation(prev => ({
            ...prev,
            paymentStatus: 'paid'
          }));
          
          // Show acknowledgment after successful payment
          setShowAcknowledgment(true);
        } catch (updateError) {
          console.error('Error updating payment status:', updateError);
          // Don't show error to user, just log it
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Error verifying payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnHome = () => {
    navigate('/mainhome');
  };

  const handleViewDonations = () => {
    navigate('/donordashboard');
  };

  const handleAcknowledgmentDownload = () => {
    // Optional: Add any additional logic after PDF download
    console.log('Acknowledgment PDF downloaded successfully');
  };

  if (loading) {
    return (
      <div className="donation-success-container">
        {/* ✅ Main navbar integration - ensures consistent navigation across all subsystems */}
        <MainNav />
        <div className="loading-message">
          <h2>Verifying your donation...</h2>
          <p>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donation-success-container">
        {/* ✅ Main navbar integration - ensures consistent navigation across all subsystems */}
        <MainNav />
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleReturnHome} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Show acknowledgment if payment is successful
  if (showAcknowledgment && donation?.paymentStatus === 'paid') {
    return (
      <div className="donation-success-container">
        {/* ✅ Main navbar integration - ensures consistent navigation across all subsystems */}
        <MainNav />
        <DonationAcknowledgment 
          donation={donation} 
          onDownload={handleAcknowledgmentDownload}
        />
      </div>
    );
  }

  return (
    <div className="donation-success-container">
      {/* ✅ Main navbar integration - ensures consistent navigation across all subsystems */}
      <MainNav />
      
      <div className="success-content">
        <div className="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </div>

        <h1 className="success-title">Thank You for Your Donation!</h1>
        
        <div className="donation-details">
          <h2>Donation Details</h2>
          <div className="detail-row">
            <span className="label">Donor Name:</span>
            <span className="value">{donation?.donorName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Amount:</span>
            <span className="value amount">LKR {donation?.amount?.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Package:</span>
            <span className="value">{donation?.packageName || 'Custom'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className="value status paid">✓ Paid</span>
          </div>
        </div>

        <div className="thank-you-message">
          <p>
            Your generous donation will make a significant impact on our cause. 
            We truly appreciate your support and commitment to making a difference.
          </p>
          <p>
            Your official donation acknowledgment is being prepared and will be available shortly.
          </p>
        </div>

        <div className="action-buttons">
          <button onClick={handleReturnHome} className="btn-secondary">
            Return to Home
          </button>
          <button onClick={handleViewDonations} className="btn-primary">
            Make Another Donation
          </button>
        </div>
      </div>
    </div>
  );
}

export default DonationSuccess;
