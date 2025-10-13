import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeliveryLocationModal.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const deliveryIcon = L.divIcon({
  className: 'custom-delivery-marker',
  html: '<div style="background-color: #dc3545; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: '<div style="background-color: #28a745; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map view updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

function DeliveryLocationModal({ isOpen, onClose, delivery, title = "Delivery Location" }) {
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationTimestamp, setLocationTimestamp] = useState(null);
  const mapRef = useRef(null);

  // Delivery coordinates
  const deliveryCoords = delivery?.coordinates?.lat && delivery?.coordinates?.lng 
    ? { lat: delivery.coordinates.lat, lng: delivery.coordinates.lng }
    : { lat: 6.9271, lng: 79.8612 }; // Default to Colombo

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      console.log('Requesting user location...');
      setIsGettingLocation(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentTime = new Date();
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: currentTime
          };
          
          console.log('Location detected successfully:', locationData);
          setUserLocation(locationData);
          setLocationTimestamp(currentTime);
          setIsGettingLocation(false);
          setLocationError(null);
        },
        (error) => {
          console.log('Error getting user location:', error);
          setIsGettingLocation(false);
          let errorMessage = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location services and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          setLocationError(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  // Automatically detect user location when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always get fresh location when modal opens
      console.log('Modal opened, getting user location...');
      getUserLocation();
    }
  }, [isOpen]);

  // Reset location state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUserLocation(null);
      setLocationError(null);
      setIsGettingLocation(false);
      setLocationTimestamp(null);
    }
  }, [isOpen]);

  const handleGetDirections = () => {
    console.log('Get Directions clicked, userLocation:', userLocation);
    if (userLocation) {
      // Open Google Maps with current location as starting point
      const directionsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${deliveryCoords.lat},${deliveryCoords.lng}`;
      console.log('Opening Google Maps with URL:', directionsUrl);
      window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    } else {
      // If no location is available, get it first
      console.log('No user location available, requesting location...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            console.log('Location obtained for directions:', location);
            setUserLocation(location);
            // Open Google Maps with the newly obtained location
            const directionsUrl = `https://www.google.com/maps/dir/${location.lat},${location.lng}/${deliveryCoords.lat},${deliveryCoords.lng}`;
            console.log('Opening Google Maps with URL:', directionsUrl);
            window.open(directionsUrl, '_blank', 'noopener,noreferrer');
          },
          (error) => {
            alert('Please enable location services to get directions.');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="marketplace-manager-modal-overlay" onClick={onClose}>
      <div className="marketplace-manager-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modern Header with Icon */}
        <div className="marketplace-manager-modal-header">
          <div className="marketplace-manager-header-content">
            <div className="marketplace-manager-header-icon">🚚</div>
            <h3>{title}</h3>
          </div>
          <button className="marketplace-manager-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="marketplace-manager-modal-body">
          {/* Delivery Details Card */}
          <div className="marketplace-manager-event-details-card">
            <div className="marketplace-manager-event-header">
              <h4>{delivery?.productName || delivery?.artId?.artType || 'Delivery'}</h4>
            </div>
            <div className="marketplace-manager-event-info-grid">
              <div className="marketplace-manager-info-item">
                <div className="marketplace-manager-info-icon">📍</div>
                <div className="marketplace-manager-info-content">
                  <span className="marketplace-manager-info-label">Address</span>
                  <span className="marketplace-manager-info-value">{delivery?.address}, {delivery?.city}, {delivery?.district}</span>
                </div>
              </div>
              <div className="marketplace-manager-info-item">
                <div className="marketplace-manager-info-icon">📅</div>
                <div className="marketplace-manager-info-content">
                  <span className="marketplace-manager-info-label">Created</span>
                  <span className="marketplace-manager-info-value">{new Date(delivery?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="marketplace-manager-info-item">
                <div className="marketplace-manager-info-icon">🕒</div>
                <div className="marketplace-manager-info-content">
                  <span className="marketplace-manager-info-label">Time</span>
                  <span className="marketplace-manager-info-value">{new Date(delivery?.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Status Card */}
          <div className="location-status-card">
            {isGettingLocation ? (
              <div className="status-loading">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
                <p>Detecting your current location...</p>
              </div>
            ) : locationError ? (
              <div className="status-error">
                <div className="status-icon"></div>
                <div className="status-content">
                  <h5>Location Error</h5>
                  <p>{locationError}</p>
                  <button 
                    className="btn btn-outline"
                    onClick={getUserLocation}
                  >
                    <span className="btn-icon"></span>
                    Try Again
                  </button>
                </div>
              </div>
            ) : userLocation ? (
              <div className="status-success">
                <div className="status-icon"></div>
                <div className="status-content">
                  <h5>Location Detected</h5>
                  <div className="location-details">
                    <div className="location-item">
                      <div className="item-icon"></div>
                      <div className="item-content">
                        <span className="item-label">Coordinates</span>
                        <span className="item-value">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
                      </div>
                    </div>
                    <div className="location-item">
                      <div className="item-icon"></div>
                      <div className="item-content">
                        <span className="item-label">Detected</span>
                        <span className="item-value">{locationTimestamp ? locationTimestamp.toLocaleTimeString() : 'Just now'}</span>
                      </div>
                    </div>
                    {userLocation.accuracy && (
                      <div className="location-item">
                        <div className="item-icon"></div>
                        <div className="item-content">
                          <span className="item-label">Accuracy</span>
                          <span className="item-value">±{Math.round(userLocation.accuracy)}m</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          {userLocation && (
            <div className="marketplace-manager-action-buttons">
              <button
                onClick={handleGetDirections}
                className="marketplace-manager-btn marketplace-manager-btn-primary"
              >
                Get Directions
              </button>
              <button 
                className="marketplace-manager-btn marketplace-manager-btn-secondary"
                onClick={getUserLocation}
              >
                <span className="marketplace-manager-btn-icon">↻</span>
                Refresh Location
              </button>
            </div>
          )}

          {/* Map Container */}
          <div className="marketplace-manager-map-container">
            <MapContainer
              center={deliveryCoords}
              zoom={15}
              style={{ height: '450px', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Delivery marker */}
              <Marker position={deliveryCoords} icon={deliveryIcon}>
                <Popup>
                  <div className="marketplace-manager-venue-popup">
                    <h4>Delivery Location</h4>
                    <p>{delivery?.address}, {delivery?.city}</p>
                    <p><strong>Customer:</strong> {delivery?.customerName}</p>
                    <p><strong>Product:</strong> {delivery?.productName || delivery?.artId?.artType}</p>
                  </div>
                </Popup>
              </Marker>

              {/* User location marker (if available) */}
              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="marketplace-manager-user-popup">
                      <h4>Your Location</h4>
                      <p>You are here</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              <MapUpdater center={deliveryCoords} zoom={15} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryLocationModal;
