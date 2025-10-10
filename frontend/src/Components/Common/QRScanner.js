import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './QRScanner.css';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Simple QR code detection using canvas and basic pattern recognition
  const detectQRCode = (imageData) => {
    // This is a simplified QR detection - in production, you'd use a proper QR library
    // For now, we'll simulate detection by looking for specific patterns
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Look for QR code corner patterns (simplified)
    let qrDetected = false;
    let detectedText = '';
    
    // This is a placeholder - in a real implementation, you'd use a proper QR library
    // For demonstration, we'll check if there's text that looks like our QR data format
    try {
      // Simulate QR code detection
      const testData = '{"registrationId":"REG-1736532123456-TEST123","artistId":"507f1f77bcf86cd799439012","eventId":"507f1f77bcf86cd799439011","artistEmail":"test@example.com","eventTitle":"Test Event","generatedAt":"2025-01-10T13:34:21.636Z"}';
      
      // In a real implementation, this would be replaced with actual QR code detection
      // For now, we'll use a manual input method
      return null; // Return null to trigger manual input
    } catch (e) {
      return null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setError('');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrData = detectQRCode(imageData);
      
      if (qrData) {
        validateQRCode(qrData);
      }
    }
  };

  const validateQRCode = async (qrData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/qr/validate', {
        qrData: qrData
      });
      
      if (response.data.success) {
        setScannedData(response.data.data);
        setShowResult(true);
        stopCamera();
      } else {
        setError(response.data.message || 'Invalid QR code');
      }
    } catch (err) {
      console.error('Error validating QR code:', err);
      setError('Error validating QR code. Please try again.');
    }
  };

  const handleManualInput = () => {
    const qrData = prompt('Enter QR code data manually:');
    if (qrData) {
      validateQRCode(qrData);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setShowResult(false);
    setError('');
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <h2>QR Code Scanner</h2>
        <p>Scan an artist event pass QR code to verify registration</p>
      </div>

      {!showResult ? (
        <div className="qr-scanner-content">
          {!isScanning ? (
            <div className="qr-scanner-start">
              <button 
                className="qr-start-button"
                onClick={startCamera}
              >
                Start Camera
              </button>
              <button 
                className="qr-manual-button"
                onClick={handleManualInput}
              >
                Enter QR Code Manually
              </button>
            </div>
          ) : (
            <div className="qr-scanner-active">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="qr-video"
              />
              <canvas 
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              <div className="qr-scan-overlay">
                <div className="qr-scan-frame"></div>
                <p>Position QR code within the frame</p>
              </div>
              <div className="qr-controls">
                <button 
                  className="qr-capture-button"
                  onClick={captureFrame}
                >
                  Capture & Scan
                </button>
                <button 
                  className="qr-stop-button"
                  onClick={stopCamera}
                >
                  Stop Camera
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="qr-error">
              <p>{error}</p>
              <button onClick={() => setError('')}>Dismiss</button>
            </div>
          )}
        </div>
      ) : (
        <div className="qr-result">
          <div className="qr-result-header">
            <div className="qr-success-icon">✅</div>
            <h3>QR Code Verified</h3>
          </div>
          
          <div className="qr-result-card">
            <div className="qr-artist-info">
              <div className="qr-info-row">
                <span className="qr-label">Artist:</span>
                <span className="qr-value artist-name">{scannedData.artist.name}</span>
              </div>
              
              <div className="qr-info-row">
                <span className="qr-label">Event:</span>
                <span className="qr-value event-name">{scannedData.event.title}</span>
              </div>
              
              <div className="qr-info-row">
                <span className="qr-label">Status:</span>
                <span className={`qr-status-badge ${scannedData.status.eventPassed ? 'passed' : 'confirmed'}`}>
                  {scannedData.status.eventPassed ? 'Event has passed' : '✅ Registered & Confirmed'}
                </span>
              </div>
            </div>
            
            <div className="qr-event-details">
              <div className="qr-detail-item">
                <div className="qr-detail-icon">📅</div>
                <div className="qr-detail-text">
                  <span className="qr-detail-label">Event Date</span>
                  <span className="qr-detail-value">{new Date(scannedData.event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
              
              <div className="qr-detail-item">
                <div className="qr-detail-icon">📍</div>
                <div className="qr-detail-text">
                  <span className="qr-detail-label">Venue</span>
                  <span className="qr-detail-value">{scannedData.event.venue}</span>
                </div>
              </div>
              
              <div className="qr-detail-item">
                <div className="qr-detail-icon">🆔</div>
                <div className="qr-detail-text">
                  <span className="qr-detail-label">Registration ID</span>
                  <span className="qr-detail-value">{scannedData.registration.id}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="qr-result-actions">
            <button 
              className="qr-rescan-button"
              onClick={resetScanner}
            >
              🔄 Scan Another QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
