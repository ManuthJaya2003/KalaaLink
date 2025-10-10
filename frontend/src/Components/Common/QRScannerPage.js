import React from 'react';
import QRScanner from './QRScanner';
import './QRScannerPage.css';

const QRScannerPage = () => {
  return (
    <div className="qr-scanner-page">
      <div className="qr-scanner-page-header">
        <h1>Event Pass Verification</h1>
        <p>Scan artist event pass QR codes to verify registration status</p>
      </div>
      
      <div className="qr-scanner-page-content">
        <QRScanner />
      </div>
      
      <div className="qr-scanner-page-footer">
        <p>KalaaLink Event Management System</p>
      </div>
    </div>
  );
};

export default QRScannerPage;
