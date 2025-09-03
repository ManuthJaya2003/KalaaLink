import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon using a simple SVG
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy41OSAyIDQgNS41OSA0IDEwQzQgMTUuNTkgMTIgMjIgMTIgMjJDMjIgMTUuNTkgMjAgMTAgMjAgMTBDMjAgNS41OSAxNi40MSAyIDEyIDJaIiBmaWxsPSIjRkY2QjM1Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle map view updates
function MapUpdater({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

function LiveLocationMap() {
  const [position, setPosition] = useState([7.2906, 80.6337]); // Default: Kandy, Sri Lanka
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    // Watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setError(null);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to retrieve your location. Using default position.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );

    // Cleanup function
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="live-location-map">
      <h3>📍 We are here</h3>
      {error && (
        <div className="location-error">
          <p>{error}</p>
        </div>
      )}
      <div className="map-container">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              📍 KalaaLink Hub!
            </Popup>
          </Marker>
          <MapUpdater position={position} />
        </MapContainer>
      </div>
      <div className="location-info">
        <p><strong>Current Coordinates:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
        <p><small>Your location is being tracked in real-time</small></p>
      </div>
    </div>
  );
}

export default LiveLocationMap;
