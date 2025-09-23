import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icon for venue selection
const venueMarkerIcon = L.divIcon({
  className: 'custom-venue-marker',
  html: '<div style="background-color: #667eea; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📍</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map clicks and marker placement
function MapClickHandler({ onLocationSelect, selectedLocation }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });

  return null;
}

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

// Map Picker Component
const MapPicker = ({ selectedLocation, onLocationSelect, onAddressChange }) => {
  const [address, setAddress] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  // Default center (Colombo, Sri Lanka)
  const defaultCenter = { lat: 6.9271, lng: 79.8612 };
  const mapCenter = selectedLocation || defaultCenter;

  // Initialize address from selectedLocation
  useEffect(() => {
    if (selectedLocation && selectedLocation.address) {
      setAddress(selectedLocation.address);
    }
  }, [selectedLocation]);

  // Initialize address when component first loads with existing data
  useEffect(() => {
    if (selectedLocation && selectedLocation.address && !address) {
      setAddress(selectedLocation.address);
    }
  }, [selectedLocation, address]);

  // Show map by default when component mounts
  useEffect(() => {
    setIsMapVisible(true);
  }, []);

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    // Always try to reverse geocode the location to get an address
    reverseGeocode(location.lat, location.lng);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        const address = data.display_name;
        setAddress(address);
        onAddressChange(address);
      } else {
        // If no address found, create a fallback address with coordinates
        const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(fallbackAddress);
        onAddressChange(fallbackAddress);
      }
    } catch (error) {
      console.log("Reverse geocoding failed:", error);
      // Create a fallback address with coordinates
      const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallbackAddress);
      onAddressChange(fallbackAddress);
    }
  };

  const handleAddressSubmit = async () => {
    if (!address.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        onLocationSelect(location);
      }
    } catch (error) {
      console.log("Geocoding failed:", error);
    }
  };

  return (
    <div className="map-picker-container">
      <div className="location-input-section">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter venue address or click on map to set location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="venue-address-input"
          />
          <button 
            type="button" 
            onClick={handleAddressSubmit}
            className="geocode-btn"
          >
            Search
          </button>
        </div>
        
        <button
          type="button"
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="toggle-map-btn"
        >
          {isMapVisible ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {isMapVisible && (
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
            className="venue-map"
            key={`map-${isMapVisible}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {selectedLocation && (
              <Marker position={selectedLocation} icon={venueMarkerIcon}>
                <div className="venue-popup">
                  <h4>Selected Venue</h4>
                  <p>Click elsewhere on map to change location</p>
                </div>
              </Marker>
            )}
            
            <MapClickHandler onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
            <MapUpdater center={mapCenter} zoom={13} />
          </MapContainer>
          
          <div className="map-instructions">
            <p>💡 <strong>Instructions:</strong></p>
            <ul>
              <li>Click anywhere on the map to set the venue location</li>
              <li>Or enter an address above and click Search</li>
              <li>The marker shows your selected venue location</li>
            </ul>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div className="selected-location-info">
          <p><strong>Selected Location:</strong></p>
          <p>📍 Latitude: {selectedLocation.lat.toFixed(6)}</p>
          <p>📍 Longitude: {selectedLocation.lng.toFixed(6)}</p>
          {address && <p>📍 Address: {address}</p>}
        </div>
      )}
    </div>
  );
};

export default MapPicker;
