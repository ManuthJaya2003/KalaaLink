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
  html: '<div style="background-color: #dc3545; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🎯</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: '<div style="background-color: #28a745; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📍</div>',
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
  const mapRef = useRef(null);

  // Venue coordinates from booking
  const venueCoords = booking?.eventLocation?.lat && booking?.eventLocation?.lng 
    ? { lat: booking.eventLocation.lat, lng: booking.eventLocation.lng }
    : { lat: 6.9271, lng: 79.8612 }; // Default to Colombo

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
    if (userLocation) {
      calculateRoute(userLocation, venueCoords);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            setUserLocation(location);
            calculateRoute(location, venueCoords);
          },
          (error) => {
            alert('Please enable location services to get directions.');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="booking-details">
            <h4>{booking?.eventType || 'Event'}</h4>
            <p><strong>Venue:</strong> {booking?.eventVenue}</p>
            <p><strong>Date:</strong> {new Date(booking?.eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {booking?.eventTime}</p>
          </div>

          <div className="map-controls">
            <button
              onClick={handleGetDirections}
              disabled={isCalculatingRoute}
              className="btn btn-primary"
            >
              {isCalculatingRoute ? '🔄 Calculating...' : '🚗 Request Directions'}
            </button>

            <button
              onClick={() => {
                const userLocation = navigator.geolocation ? 
                  new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
                      () => resolve(null),
                      { enableHighAccuracy: true, timeout: 5000 }
                    );
                  }) : 
                  Promise.resolve(null);
                
                userLocation.then((currentLocation) => {
                  if (currentLocation) {
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${venueCoords.lat},${venueCoords.lng}`;
                    window.open(googleMapsUrl, '_blank');
                  } else {
                    // If location access fails, use venue as destination only
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venueCoords.lat},${venueCoords.lng}`;
                    window.open(googleMapsUrl, '_blank');
                  }
                });
              }}
              className="btn btn-success"
              style={{ marginLeft: '10px' }}
            >
              🗺️ Get Directions
            </button>

            {showDirections && (
              <button onClick={clearDirections} className="btn btn-secondary">
                ❌ Clear Route
              </button>
            )}

            {routeInfo && (
              <div className="route-info">
                <span><strong>Distance:</strong> {routeInfo.distance} km</span>
                <span><strong>Time:</strong> ~{routeInfo.time}</span>
              </div>
            )}
          </div>

          <div className="map-container">
            <MapContainer
              center={venueCoords}
              zoom={15}
              style={{ height: '400px', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Venue marker */}
              <Marker position={venueCoords} icon={venueIcon}>
                <Popup>
                  <div>
                    <h4>🎯 Event Venue</h4>
                    <p>{booking?.eventVenue}</p>
                  </div>
                </Popup>
              </Marker>

              {/* User location marker */}
              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div>
                      <h4>📍 Your Location</h4>
                      <p>You are here</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Route polyline */}
              {showDirections && routeCoordinates.length > 0 && (
                <Polyline
                  positions={routeCoordinates}
                  color="#667eea"
                  weight={4}
                  opacity={0.8}
                  dashArray="10, 5"
                />
              )}

              <MapUpdater center={venueCoords} zoom={15} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationModal;
