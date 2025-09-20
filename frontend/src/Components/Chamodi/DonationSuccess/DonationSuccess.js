import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// ✅ Main navbar integration - using main project navigation for consistency
import MainNav from '../../MainNav/MainNav';
import AuthFooter from '../../Common/AuthFooter';
import DonationAcknowledgment from '../DonationAcknowledgment/DonationAcknowledgment';
import axios from 'axios';
import './DonationSuccess.css';

function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setError('No session ID found');
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

  const handlePrintAcknowledgement = () => {
    if (!donation) return;
    
    // Generate a professional donation acknowledgement
    generateAcknowledgementPDF();
  };

  const generateAcknowledgementPDF = () => {
    // Create a new window with the acknowledgement content
    const acknowledgementWindow = window.open('', '_blank', 'width=800,height=600');
    
    const acknowledgementHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Donation Acknowledgement - ${donation.donorName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .acknowledgement {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .acknowledgement::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
          }
          .acknowledgement-header {
            margin-bottom: 30px;
          }
          .acknowledgement-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .acknowledgement-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 20px;
          }
          .acknowledgement-logo {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .acknowledgement-logo img {
            height: 60px;
            width: auto;
            max-width: 200px;
            object-fit: contain;
          }
          .acknowledgement-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
            text-align: left;
          }
          .acknowledgement-detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .acknowledgement-detail-row:last-child {
            border-bottom: none;
          }
          .acknowledgement-detail-label {
            font-weight: 600;
            color: #495057;
            min-width: 120px;
          }
          .acknowledgement-detail-value {
            color: #2c3e50;
            text-align: right;
            flex: 1;
          }
          .acknowledgement-status {
            background: #28a745;
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            display: inline-block;
            margin: 20px 0;
          }
          .acknowledgement-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .thank-you-message {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
          }
          .thank-you-message p {
            margin: 10px 0;
            line-height: 1.6;
            color: #2c3e50;
          }
          @media print {
            body { background: white; }
            .acknowledgement { box-shadow: none; border: 2px solid #333; }
          }
        </style>
      </head>
      <body>
        <div class="acknowledgement">
          <div class="acknowledgement-header">
            <div class="acknowledgement-logo">
              <img src="/logo.png" alt="KalaaLink Logo" />
            </div>
            <div class="acknowledgement-title">DONATION ACKNOWLEDGEMENT</div>
            <div class="acknowledgement-subtitle">KalaaLink - Your Gateway to Art & Culture</div>
          </div>
          
          <div class="acknowledgement-details">
            <div class="acknowledgement-detail-row">
              <span class="acknowledgement-detail-label">Donor Name:</span>
              <span class="acknowledgement-detail-value">${donation.donorName || 'N/A'}</span>
            </div>
            <div class="acknowledgement-detail-row">
              <span class="acknowledgement-detail-label">Donation Amount:</span>
              <span class="acknowledgement-detail-value">LKR ${donation.amount?.toLocaleString() || '0'}</span>
            </div>
            <div class="acknowledgement-detail-row">
              <span class="acknowledgement-detail-label">Package:</span>
              <span class="acknowledgement-detail-value">${donation.packageName || 'Custom Donation'}</span>
            </div>
            <div class="acknowledgement-detail-row">
              <span class="acknowledgement-detail-label">Date:</span>
              <span class="acknowledgement-detail-value">${new Date().toLocaleDateString()}</span>
            </div>
            <div class="acknowledgement-detail-row">
              <span class="acknowledgement-detail-label">Status:</span>
              <span class="acknowledgement-detail-value">
                <span class="acknowledgement-status">✓ Confirmed</span>
              </span>
            </div>
          </div>

          <div class="thank-you-message">
            <p><strong>Thank You for Your Generous Donation!</strong></p>
            <p>Your contribution of LKR ${donation.amount?.toLocaleString() || '0'} will make a significant impact on our cause. We truly appreciate your support and commitment to making a difference in the community.</p>
            <p>This acknowledgement serves as your official receipt for tax purposes. Please keep this document for your records.</p>
          </div>

          <div class="acknowledgement-footer">
            <p>KalaaLink - Connecting Art, Culture & Community</p>
            <p>For any questions regarding this donation, please contact us at support@kalaalink.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    acknowledgementWindow.document.write(acknowledgementHTML);
    acknowledgementWindow.document.close();
    
    // Focus the window and trigger print dialog
    acknowledgementWindow.focus();
    setTimeout(() => {
      acknowledgementWindow.print();
    }, 500);
  };


  if (error) {
    return (
      <div>
        <MainNav />
        <div className="success-container">
          <div className="success-card">
            <div className="error-message">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={handleReturnHome} className="btn btn-primary">
                Return Home
              </button>
            </div>
          </div>
        </div>
        <AuthFooter />
      </div>
    );
  }

  // Show acknowledgment if payment is successful
  if (showAcknowledgment && donation?.paymentStatus === 'paid') {
    return (
      <div>
        <MainNav />
        <div className="success-container">
          <div className="success-card">
            <DonationAcknowledgment 
              donation={donation} 
              onDownload={handleAcknowledgmentDownload}
            />
          </div>
        </div>
        <AuthFooter />
      </div>
    );
  }

  return (
    <div>
      <MainNav />
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1 className="success-title">Payment Successful!</h1>
          <p className="success-subtitle">
            Your donation has been confirmed and payment has been processed.
          </p>

          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto',
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <img src="/logo.png" alt="KalaaLink Logo" style={{ height: '50px', width: 'auto', maxWidth: '150px' }} />
            </div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#2D3748' }}>Donation Details</h3>
            <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
              <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Donor:</span>
              <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>{donation?.donorName || "Donor"}</span>
            </div>
            <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
              <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Amount:</span>
              <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>LKR {donation?.amount?.toLocaleString() || "0"}</span>
            </div>
            <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
              <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Package:</span>
              <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>{donation?.packageName || 'Custom'}</span>
            </div>
            <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
              <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Status:</span>
              <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>Confirmed</span>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={handlePrintAcknowledgement} className="btn btn-primary">
              Print Acknowledgement
            </button>
            <button onClick={handleViewDonations} className="btn btn-success">
              Make Another Donation
            </button>
            <button onClick={handleReturnHome} className="btn btn-secondary">
              Return to Home
            </button>
          </div>

          <div className="success-info">
            <p>
              <strong>Important:</strong> Your generous donation will make a significant impact on our cause. 
              We truly appreciate your support and commitment to making a difference.
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

export default DonationSuccess;
