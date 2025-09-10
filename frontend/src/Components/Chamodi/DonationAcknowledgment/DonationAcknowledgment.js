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
      const element = document.getElementById('acknowledgment-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      const imgData = canvas.toDataURL('image/png');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Donation Acknowledgment</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            .print-content {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .print-content { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Donation Acknowledgment" class="print-content" />
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
      `);
      
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

  useEffect(() => {
    // Auto-generate PDF when component mounts
    if (donation && donation.paymentStatus === 'paid') {
      setTimeout(() => {
        generatePDF();
      }, 1000); // Small delay to ensure component is fully rendered
    }
  }, [donation]);

  if (!donation) {
    return <div>No donation data available</div>;
  }

  return (
    <div className="donation-acknowledgment-container">
      <div className="acknowledgment-header">
        <h2>Donation Acknowledgment</h2>
        <p>Your donation has been successfully processed</p>
      </div>

      <div id="acknowledgment-content" className="acknowledgment-content">
        <div className="acknowledgment-letterhead">
          <div className="organization-info">
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
            <h3>Thank You for Your Generous Donation</h3>
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
          <button 
            onClick={() => window.print()} 
            className="download-btn secondary"
          >
            Quick Print
          </button>
        </div>
        <p className="download-note">
          <strong>Print/Save:</strong> Opens in new window for printing or saving as PDF.<br/>
          <strong>Quick Print:</strong> Prints current page directly.
        </p>
      </div>
    </div>
  );
};

export default DonationAcknowledgment;
