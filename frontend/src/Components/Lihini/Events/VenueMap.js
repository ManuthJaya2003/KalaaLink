import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getVenueCoordinates } from './geocodingService';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const venueIcon = L.divIcon({
  className: 'custom-venue-marker',
  html: '<div style="background-color: #667eea; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: '<div style="background-color: #28a745; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const startIcon = L.divIcon({
  className: 'custom-start-marker',
  html: '<div style="background-color: #28a745; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚗</div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const endIcon = L.divIcon({
  className: 'custom-end-marker',
  html: '<div style="background-color: #dc3545; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎯</div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Component to handle map location updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

// Component to handle user location
function UserLocation({ onLocationFound }) {
  const map = useMap();
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationFound({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log('Error getting user location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, [map, onLocationFound]);
  
  return null;
}

function VenueMap({ event, height = "400px" }) {
  // All state hooks must be at the top
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [geocodedCoords, setGeocodedCoords] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [directionsPanel, setDirectionsPanel] = useState(false);
  
  const mapRef = useRef(null);
  
  // Default coordinates (can be overridden by event data)
  const defaultCoordinates = {
    lat: 6.9271, // Default to Colombo, Sri Lanka
    lng: 79.8612
  };
  
  // Get venue coordinates from event, geocoded results, or use defaults
  const venueCoords = useMemo(() => {
    if (event?.venueCoordinates?.latitude && event?.venueCoordinates?.longitude) {
      return { lat: event.venueCoordinates.latitude, lng: event.venueCoordinates.longitude };
    } else if (geocodedCoords) {
      return geocodedCoords;
    } else {
      return defaultCoordinates;
    }
  }, [event?.venueCoordinates?.latitude, event?.venueCoordinates?.longitude, geocodedCoords]);
  
  useEffect(() => {
    // Set map center to venue location
    setMapCenter(venueCoords);
  }, [venueCoords]);
  
  const handleLocationFound = (location) => {
    setUserLocation(location);
  };

  // Calculate route between two points using great circle distance
  const calculateRoute = async (start, end) => {
    if (!start || !end) return;
    
    setIsCalculatingRoute(true);
    
    try {
      // Create a simple route with intermediate points for better visualization
      const route = [];
      const steps = 20; // Number of intermediate points
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const lat = start.lat + (end.lat - start.lat) * ratio;
        const lng = start.lng + (end.lng - start.lng) * ratio;
        route.push([lat, lng]);
      }
      
      setRouteCoordinates(route);
      
      // Calculate distance and estimated time
      const distance = calculateDistance(start, end);
      const estimatedTime = calculateEstimatedTime(distance);
      
      setRouteInfo({
        distance: distance.toFixed(1),
        time: estimatedTime,
        steps: generateTurnByTurn(start, end, route)
      });
      
      setShowDirections(true);
      
      // Fit map to show both points and route
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

  // Calculate distance between two points using Haversine formula
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

  // Calculate estimated travel time
  const calculateEstimatedTime = (distance) => {
    const avgSpeed = 30; // Average speed in km/h (urban driving)
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

  // Generate simple turn-by-turn directions
  const generateTurnByTurn = (start, end, route) => {
    const steps = [];
    
    // Starting point
    steps.push({
      instruction: "Start from your current location",
      distance: "0 km"
    });
    
    // Calculate bearing for general direction
    const bearing = calculateBearing(start, end);
    const direction = getDirectionFromBearing(bearing);
    
    steps.push({
      instruction: `Head ${direction} towards the venue`,
      distance: `${calculateDistance(start, end).toFixed(1)} km`
    });
    
    // Final destination
    steps.push({
      instruction: `Arrive at ${event?.eventVenue || 'the venue'}`,
      distance: "Destination"
    });
    
    return steps;
  };

  // Calculate bearing between two points
  const calculateBearing = (start, end) => {
    const dLng = (end.lng - start.lng) * Math.PI / 180;
    const lat1 = start.lat * Math.PI / 180;
    const lat2 = end.lat * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    return Math.atan2(y, x) * 180 / Math.PI;
  };

  // Convert bearing to cardinal direction
  const getDirectionFromBearing = (bearing) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index < 0 ? index + 8 : index];
  };

  const handleGetDirections = () => {
    if (userLocation) {
      // Keep existing Leaflet map functionality
      calculateRoute(userLocation, venueCoords);
      
      // Open Google Maps in new tab
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${venueCoords.lat},${venueCoords.lng}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            setUserLocation(location);
            
            // Keep existing Leaflet map functionality
            calculateRoute(location, venueCoords);
            
            // Open Google Maps in new tab
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${venueCoords.lat},${venueCoords.lng}`;
            window.open(googleMapsUrl, '_blank');
          },
          (error) => {
            alert('Please enable location services to get directions.');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }
    }
  };

  const clearDirections = () => {
    setShowDirections(false);
    setRouteCoordinates([]);
    setRouteInfo(null);
    setDirectionsPanel(false);
    
    // Reset map view to venue
    if (mapRef.current) {
      mapRef.current.setView(venueCoords, 15);
    }
  };

  // Try to geocode the venue address if no coordinates available
  useEffect(() => {
    if (!event?.venueCoordinates?.latitude && event?.eventVenue) {
      setIsGeocoding(true);
      getVenueCoordinates(event.eventVenue)
        .then(coords => {
          setGeocodedCoords(coords);
          setIsGeocoding(false);
        })
        .catch(() => {
          setIsGeocoding(false);
        });
    }
  }, [event]);
  
  // If no coordinates available and geocoding failed, show a message
  if (!event?.venueCoordinates?.latitude && !geocodedCoords && !isGeocoding) {
    return (
      <div className="venue-map-container" style={{ height, width: '100%' }}>
        <div className="venue-map-placeholder">
          <div className="map-placeholder-icon">📍</div>
          <h3>Venue Location</h3>
          <p>{event?.eventVenue || 'Venue address'}</p>
          <p className="map-note">
            <em>Note: Exact coordinates not available. Please refer to the venue address above.</em>
          </p>
        </div>
      </div>
    );
  }
  
  // Show loading while geocoding
  if (isGeocoding) {
    return (
      <div className="venue-map-container" style={{ height, width: '100%' }}>
        <div className="venue-map-placeholder">
          <div className="map-placeholder-icon">🔄</div>
          <h3>Loading Venue Location</h3>
          <p>Finding coordinates for: {event?.eventVenue}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="venue-map-container" style={{ height, width: '100%' }}>
      {/* Directions Control Panel */}
      <div className="directions-controls">
        <button 
          onClick={handleGetDirections}
          disabled={isCalculatingRoute}
          className="btn btn-primary directions-btn"
        >
          {isCalculatingRoute ? '🔄 Calculating...' : '🚗 Get Directions'}
        </button>
        
        {showDirections && (
          <button 
            onClick={clearDirections}
            className="btn btn-secondary clear-btn"
          >
            ❌ Clear Route
          </button>
        )}
        
        {showDirections && routeInfo && (
          <button 
            onClick={() => setDirectionsPanel(!directionsPanel)}
            className="btn btn-info toggle-panel-btn"
          >
            {directionsPanel ? '📋 Hide Instructions' : '📋 Show Instructions'}
          </button>
        )}
      </div>

      {/* Route Information Panel */}
      {showDirections && routeInfo && directionsPanel && (
        <div className="route-info-panel">
          <div className="route-summary">
            <h4>🚗 Route Summary</h4>
            <div className="route-stats">
              <span><strong>Distance:</strong> {routeInfo.distance} km</span>
              <span><strong>Time:</strong> ~{routeInfo.time}</span>
            </div>
          </div>
          
          <div className="turn-by-turn">
            <h4>🧭 Turn-by-Turn Instructions</h4>
            {routeInfo.steps.map((step, index) => (
              <div key={index} className="direction-step">
                <span className="step-number">{index + 1}</span>
                <span className="step-instruction">{step.instruction}</span>
                <span className="step-distance">{step.distance}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="venue-map"
        ref={mapRef}
      >
        <MapUpdater center={mapCenter} zoom={15} />
        
        {/* OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Venue marker */}
        <Marker position={venueCoords} icon={venueIcon}>
          <Popup>
            <div className="venue-popup">
              <h4>{event?.eventTitle || 'Event'}</h4>
              <p><strong>Venue:</strong> {event?.eventVenue}</p>
              {event?.eventDate && (
                <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
              )}
              {event?.eventTime && (
                <p><strong>Time:</strong> {event.eventTime}</p>
              )}
            </div>
          </Popup>
        </Marker>
        
        {/* User location marker (if available) */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="user-popup">
                <h4>Your Location</h4>
                <p>You are here</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Route markers and polyline */}
        {showDirections && routeCoordinates.length > 0 && (
          <>
            {/* Start marker */}
            <Marker position={routeCoordinates[0]} icon={startIcon}>
              <Popup>
                <div className="start-popup">
                  <h4>🚗 Start</h4>
                  <p>Your current location</p>
                </div>
              </Popup>
            </Marker>
            
            {/* End marker */}
            <Marker position={routeCoordinates[routeCoordinates.length - 1]} icon={endIcon}>
              <Popup>
                <div className="end-popup">
                  <h4>🎯 Destination</h4>
                  <p>{event?.eventVenue || 'Event venue'}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Route polyline */}
            <Polyline 
              positions={routeCoordinates}
              color="#667eea"
              weight={4}
              opacity={0.8}
              dashArray="10, 5"
            />
          </>
        )}
        
        {/* Handle user location */}
        <UserLocation onLocationFound={handleLocationFound} />
      </MapContainer>
    </div>
  );
}

export default VenueMap;
