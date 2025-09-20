import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './DonationAcknowledgment.css';

const DonationAcknowledgment = ({ donation, onDownload }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const formatAmount = (amount) => {
    return `LKR ${amount?.toLocaleString() || '0'}`;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Create a new window for printing with only the acknowledgement content
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
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
              background: white;
            }
            .acknowledgement {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .acknowledgement-letterhead {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 2px solid #C1A37F;
            }
            .logo {
              height: 40px;
              width: auto;
              max-width: 120px;
              margin-bottom: 15px;
              filter: sepia(1) hue-rotate(30deg) saturate(1.2) brightness(1.1);
            }
            .organization-info h1 {
              font-size: 2.5rem;
              color: #C1A37F;
              margin: 0 0 10px 0;
              font-weight: 700;
              letter-spacing: 2px;
            }
            .tagline {
              font-size: 1.3rem;
              color: #666;
              margin: 0 0 20px 0;
              font-style: italic;
            }
            .contact-info {
              display: flex;
              justify-content: center;
              gap: 30px;
              flex-wrap: wrap;
            }
            .contact-info p {
              margin: 0;
              color: #555;
              font-size: 1rem;
            }
            .acknowledgment-body {
              line-height: 1.8;
              color: #333;
            }
            .date-section {
              margin-bottom: 30px;
              text-align: right;
            }
            .date-section p {
              margin: 0;
              font-size: 1.1rem;
              color: #555;
            }
            .donor-info {
              background-color: #f8f9fa;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .donor-info p {
              margin: 0 0 10px 0;
              font-size: 1.1rem;
            }
            .donor-info p:last-child {
              margin-bottom: 0;
            }
            .thank-you-message {
              margin-bottom: 40px;
            }
            .thank-you-title {
              color: #C1A37F;
              font-size: 1.8rem;
              margin-bottom: 20px;
              text-align: center;
            }
            .thank-you-message p {
              margin-bottom: 20px;
              font-size: 1.1rem;
              text-align: justify;
            }
            .thank-you-message p:last-child {
              margin-bottom: 0;
            }
            .signature-section {
              margin: 50px 0;
              text-align: center;
            }
            .signature-line {
              display: inline-block;
              text-align: center;
            }
            .signature-line p {
              margin: 5px 0;
              font-size: 1rem;
            }
            .signature-line p:first-child {
              margin-bottom: 20px;
              font-size: 1.2rem;
              color: #333;
            }
            .footer-note {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
            }
            .footer-note p {
              margin: 0;
              font-size: 0.95rem;
              color: #666;
              font-style: italic;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .acknowledgement { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="acknowledgement">
            <div class="acknowledgment-letterhead">
              <div class="organization-info">
                <img src="/logo.png" alt="KalaaLink Logo" class="logo" />
                <h1>KalaaLink</h1>
                <p class="tagline">Connecting Art, Culture & Community</p>
                <div class="contact-info">
                  <p>Email: info@kalaalink.com</p>
                  <p>Website: www.kalaalink.com</p>
                </div>
              </div>
            </div>

            <div class="acknowledgment-body">
              <div class="date-section">
                <p><strong>Date:</strong> ${currentDate}</p>
              </div>

              <div class="donor-info">
                <p><strong>Donor Name:</strong> ${donation.donorName || 'Anonymous'}</p>
                <p><strong>Donation Amount:</strong> ${formatAmount(donation.amount)}</p>
                <p><strong>Payment Method:</strong> Stripe Payment</p>
                <p><strong>Transaction ID:</strong> ${donation.sessionId || 'N/A'}</p>
              </div>

              <div class="thank-you-message">
                <h3 class="thank-you-title">Thank You for Your Generous Donation</h3>
                <p>
                  We are deeply grateful for your generous donation of ${formatAmount(donation.amount)} 
                  received on ${currentDate}. Your contribution will be used to support our mission of 
                  connecting art, culture, and community through meaningful initiatives and programs.
                </p>
                <p>
                  Your donation helps us continue to provide valuable services, support artists, 
                  and create opportunities for cultural exchange and community engagement. 
                  We are committed to using your contribution responsibly and effectively.
                </p>
                <p>
                  This acknowledgment serves as your official receipt for tax purposes. 
                  Please retain this document for your records.
                </p>
              </div>

              <div class="signature-section">
                <div class="signature-line">
                  <p>_________________________</p>
                  <p><strong>Authorized Signature</strong></p>
                  <p>KalaaLink Organization</p>
                  <p>Date: ${currentDate}</p>
                </div>
              </div>

              <div class="footer-note">
                <p>
                  <em>
                    This is an official acknowledgment of your donation. 
                    KalaaLink is a registered organization committed to transparency and accountability.
                  </em>
                </p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(acknowledgementHTML);
      printWindow.document.close();
      
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to browser print
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  // Removed auto-generation - user must click button to print

  if (!donation) {
    return <div>No donation data available</div>;
  }

  return (
    <div className="donation-acknowledgment-container">
      <div className="success-icon">✅</div>
      <h1 className="success-title">Payment Successful!</h1>
      <p className="success-subtitle">
        Your donation has been confirmed and payment has been processed.
      </p>
      
      <div className="fancy-line"></div>

      <div id="acknowledgment-content" className="acknowledgment-content">
        <div className="acknowledgment-letterhead">
          <div className="organization-info">
            <img src="/logo.png" alt="KalaaLink Logo" className="logo" />
            <h1>KalaaLink</h1>
            <p className="tagline">Connecting Art, Culture & Community</p>
            <div className="contact-info">
              <p>Email: info@kalaalink.com</p>
              <p>Website: www.kalaalink.com</p>
            </div>
          </div>
        </div>

        <div className="acknowledgment-body">
          <div className="date-section">
            <p><strong>Date:</strong> {currentDate}</p>
          </div>

          <div className="donor-info">
            <p><strong>Donor Name:</strong> {donation.donorName || 'Anonymous'}</p>
            <p><strong>Donation Amount:</strong> {formatAmount(donation.amount)}</p>
            <p><strong>Payment Method:</strong> Stripe Payment</p>
            <p><strong>Transaction ID:</strong> {donation.sessionId || 'N/A'}</p>
          </div>

          <div className="thank-you-message">
            <h3 className="thank-you-title">Thank You for Your Generous Donation</h3>
            <p>
              We are deeply grateful for your generous donation of {formatAmount(donation.amount)} 
              received on {currentDate}. Your contribution will be used to support our mission of 
              connecting art, culture, and community through meaningful initiatives and programs.
            </p>
            <p>
              Your donation helps us continue to provide valuable services, support artists, 
              and create opportunities for cultural exchange and community engagement. 
              We are committed to using your contribution responsibly and effectively.
            </p>
            <p>
              This acknowledgment serves as your official receipt for tax purposes. 
              Please retain this document for your records.
            </p>
          </div>

          <div className="signature-section">
            <div className="signature-line">
              <p>_________________________</p>
              <p><strong>Authorized Signature</strong></p>
              <p>KalaaLink Organization</p>
              <p>Date: {currentDate}</p>
            </div>
          </div>

          <div className="footer-note">
            <p>
              <em>
                This is an official acknowledgment of your donation. 
                KalaaLink is a registered organization committed to transparency and accountability.
              </em>
            </p>
          </div>
        </div>
      </div>

      <div className="acknowledgment-actions">
        <div className="action-buttons">
          <button 
            onClick={generatePDF} 
            disabled={isGenerating}
            className="download-btn primary"
          >
            {isGenerating ? 'Generating Acknowledgment...' : 'Print/Save Acknowledgment'}
          </button>
        </div>
        <p className="download-note">
          <strong>Print/Save:</strong> Opens in new window for printing or saving as PDF.
        </p>
      </div>
    </div>
  );
};

export default DonationAcknowledgment;
