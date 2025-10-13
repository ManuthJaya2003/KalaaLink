import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationModal.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const venueIcon = L.divIcon({
  className: 'custom-venue-marker',
  html: '<div style="background-color: #C1A37F; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">V</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: '<div style="background-color: #2c3e50; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">U</div>',
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

function LocationModal({ isOpen, onClose, booking, title = "Venue Location" }) {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationTimestamp, setLocationTimestamp] = useState(null);
  const mapRef = useRef(null);

  // Venue coordinates from booking
  const venueCoords = booking?.eventLocation?.lat && booking?.eventLocation?.lng 
    ? { lat: booking.eventLocation.lat, lng: booking.eventLocation.lng }
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

  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    if (!userLocation) return null;
    return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${venueCoords.lat},${venueCoords.lng}`;
  };

  // Automatically detect user location when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always get fresh location when modal opens
      console.log('Modal opened, getting user location...');
      getUserLocation();
      
      // Force map to re-render after a short delay to ensure proper initialization
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
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

  // Handle map initialization when modal opens
  useEffect(() => {
    if (isOpen && mapRef.current) {
      // Small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        if (mapRef.current) {
          console.log('Map container found, invalidating size...');
          mapRef.current.invalidateSize();
        } else {
          console.log('Map container not found');
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const calculateDistance = (start, end) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateEstimatedTime = (distance) => {
    const avgSpeed = 30; // Average speed in km/h
    const timeInHours = distance / avgSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);

    if (timeInMinutes < 60) {
      return `${timeInMinutes} min`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return `${hours}h ${minutes}min`;
    }
  };

  const calculateRoute = async (start, end) => {
    if (!start || !end) return;

    setIsCalculatingRoute(true);

    try {
      // Create a simple route with intermediate points
      const route = [];
      const steps = 20;

      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const lat = start.lat + (end.lat - start.lat) * ratio;
        const lng = start.lng + (end.lng - start.lng) * ratio;
        route.push([lat, lng]);
      }

      setRouteCoordinates(route);

      const distance = calculateDistance(start, end);
      const estimatedTime = calculateEstimatedTime(distance);

      setRouteInfo({
        distance: distance.toFixed(1),
        time: estimatedTime
      });

      setShowDirections(true);

      // Fit map to show both points
      if (mapRef.current) {
        const bounds = L.latLngBounds([start, end]);
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }

    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleGetDirections = () => {
    console.log('Get Directions clicked, userLocation:', userLocation);
    if (userLocation) {
      // Open Google Maps with current location as starting point
      const directionsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${venueCoords.lat},${venueCoords.lng}`;
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
            const directionsUrl = `https://www.google.com/maps/dir/${location.lat},${location.lng}/${venueCoords.lat},${venueCoords.lng}`;
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

  const clearDirections = () => {
    setShowDirections(false);
    setRouteCoordinates([]);
    setRouteInfo(null);
    if (mapRef.current) {
      mapRef.current.setView(venueCoords, 15);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="artist-manager-modal-overlay" onClick={onClose}>
      <div className="artist-manager-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modern Header with Icon */}
        <div className="artist-manager-modal-header">
          <div className="artist-manager-header-content">
            <div className="artist-manager-header-icon">📍</div>
            <h3>{title}</h3>
          </div>
          <button className="artist-manager-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="artist-manager-modal-body">
          {/* Event Details Card */}
          <div className="artist-manager-event-details-card">
            <div className="artist-manager-event-header">
              <h4>{booking?.eventType || 'Event'}</h4>
            </div>
            <div className="artist-manager-event-info-grid">
              <div className="artist-manager-info-item">
                <div className="artist-manager-info-content">
                  <span className="artist-manager-info-label">Venue</span>
                  <span className="artist-manager-info-value">{booking?.eventVenue}</span>
                </div>
              </div>
              <div className="artist-manager-info-item">
                <div className="artist-manager-info-content">
                  <span className="artist-manager-info-label">Date</span>
                  <span className="artist-manager-info-value">{new Date(booking?.eventDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="artist-manager-info-item">
                <div className="artist-manager-info-content">
                  <span className="artist-manager-info-label">Time</span>
                  <span className="artist-manager-info-value">{booking?.eventTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Status Card */}
          <div className="artist-manager-location-status-card">
            {isGettingLocation ? (
              <div className="artist-manager-status-loading">
                <div className="artist-manager-loading-spinner">
                  <div className="artist-manager-spinner"></div>
                </div>
                <p>Detecting your current location...</p>
              </div>
            ) : locationError ? (
              <div className="artist-manager-status-error">
                <div className="artist-manager-status-icon">!</div>
                <div className="artist-manager-status-content">
                  <h5>Location Error</h5>
                  <p>{locationError}</p>
                  <button 
                    className="artist-manager-btn artist-manager-btn-outline"
                    onClick={getUserLocation}
                  >
                    <span className="artist-manager-btn-icon">↻</span>
                    Try Again
                  </button>
                </div>
              </div>
            ) : userLocation ? (
              <div className="artist-manager-status-success">
                <div className="artist-manager-status-icon">✓</div>
                <div className="artist-manager-status-content">
                  <h5>Location Detected</h5>
                  <div className="artist-manager-location-details">
                    <div className="artist-manager-location-item">
                      <div className="artist-manager-item-icon">L</div>
                      <div className="artist-manager-item-content">
                        <span className="artist-manager-item-label">Coordinates</span>
                        <span className="artist-manager-item-value">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
                      </div>
                    </div>
                    <div className="artist-manager-location-item">
                      <div className="artist-manager-item-icon">T</div>
                      <div className="artist-manager-item-content">
                        <span className="artist-manager-item-label">Detected</span>
                        <span className="artist-manager-item-value">{locationTimestamp ? locationTimestamp.toLocaleTimeString() : 'Just now'}</span>
                      </div>
                    </div>
                    {userLocation.accuracy && (
                      <div className="artist-manager-location-item">
                        <div className="artist-manager-item-icon">A</div>
                        <div className="artist-manager-item-content">
                          <span className="artist-manager-item-label">Accuracy</span>
                          <span className="artist-manager-item-value">±{Math.round(userLocation.accuracy)}m</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="artist-manager-action-buttons">
              <button
                onClick={handleGetDirections}
                className="artist-manager-btn artist-manager-btn-primary artist-manager-get-directions-btn"
              >
                Get Directions
              </button>
            <button 
              className="artist-manager-btn artist-manager-btn-secondary"
              onClick={getUserLocation}
            >
              <span className="artist-manager-btn-icon">↻</span>
              Refresh Location
            </button>
          </div>

          {/* Map Container */}
          <div className="artist-manager-map-container">
            {isOpen && (
              <MapContainer
                center={venueCoords}
                zoom={15}
                style={{ height: '400px', width: '100%' }}
                ref={mapRef}
                key={`map-${isOpen}-${booking?._id || 'default'}`}
                whenCreated={(mapInstance) => {
                  console.log('Map created successfully:', mapInstance);
                  mapRef.current = mapInstance;
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              
              {/* Venue marker */}
              <Marker position={venueCoords} icon={venueIcon}>
                <Popup>
                  <div className="artist-manager-venue-popup">
                    <h4>Event Venue</h4>
                    <p>{booking?.eventVenue}</p>
                  </div>
                </Popup>
              </Marker>

              {/* User location marker (if available) */}
              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="artist-manager-user-popup">
                      <h4>Your Location</h4>
                      <p>You are here</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              <MapUpdater center={venueCoords} zoom={15} />
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationModal;
