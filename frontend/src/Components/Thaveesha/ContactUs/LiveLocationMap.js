import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNy41OSAyIDQgNS41OSA0IDEwQzQgMTUuNTkgMTIgMjIgMTIgMjJDMjIgMTUuNTkgMjAgMTAgMjAgMTBDMjAgNS41OSAxNi40MSAyIDEyIDJaIiBmaWxsPSIjRkY2QjM1Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function LiveLocationMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [position, setPosition] = useState([7.2906, 80.6337]); // Default coordinates
  const [error, setError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'

  // Manual location request function
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    console.log('🔄 Manually requesting location...');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        console.log('📍 Manual location found:', newPos);
        setPosition(newPos);
        setError(null);
        setLocationPermission('granted');
        
        // Update map and marker if they exist
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView(newPos, mapRef.current.getZoom());
          markerRef.current.setLatLng(newPos);
          console.log('✅ Map updated to manual location');
        }
      },
      (err) => {
        console.error('❌ Manual location error:', err);
        setError('Unable to get your location. Please check your browser settings and try again.');
        setLocationPermission('denied');
      },
      { 
        enableHighAccuracy: false, 
        timeout: 20000,
        maximumAge: 0 // Don't use cached location
      }
    );
  };

  // Initialize map - run only once
  useEffect(() => {
    if (mapInitialized || !mapContainerRef.current) return;

    console.log('🚀 Starting live location map initialization...');
    
    try {
      // Check if map container already has a Leaflet map instance
      if (mapContainerRef.current._leaflet_id) {
        console.log('⚠️ Map container already initialized, cleaning up...');
        // Remove the existing map instance
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        // Clear the leaflet ID from the container
        delete mapContainerRef.current._leaflet_id;
      }

      // Ensure container has proper dimensions
      mapContainerRef.current.style.height = '400px';
      mapContainerRef.current.style.width = '100%';
      mapContainerRef.current.style.minHeight = '400px';
      mapContainerRef.current.style.display = 'block';
      mapContainerRef.current.style.position = 'relative';
      mapContainerRef.current.style.background = '#f0f0f0';
      
      // Force parent container to have proper dimensions too
      const parent = mapContainerRef.current.parentElement;
      if (parent) {
        parent.style.width = '100%';
        parent.style.height = '400px';
        parent.style.minHeight = '400px';
        parent.style.display = 'block';
      }
      
      console.log('Container dimensions set:', {
        width: mapContainerRef.current.offsetWidth,
        height: mapContainerRef.current.offsetHeight
      });
      
      // Wait a moment for styles to apply, then create map
      setTimeout(() => {
        if (!mapContainerRef.current) return;
        
        // Double-check that container is clean before creating map
        if (mapContainerRef.current._leaflet_id) {
          console.log('⚠️ Container still has leaflet_id, cleaning again...');
          delete mapContainerRef.current._leaflet_id;
        }
        
        console.log('Container dimensions after delay:', {
          width: mapContainerRef.current.offsetWidth,
          height: mapContainerRef.current.offsetHeight
        });
        
        // Create map
        const map = L.map(mapContainerRef.current, {
          center: position,
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true,
          preferCanvas: false
        });

        console.log('✅ Live map created');

        // Add tiles with better configuration
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 1,
          tileSize: 256,
          zoomOffset: 0
        }).addTo(map);

        // Add fallback tile layer
        const fallbackTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 1
        });

        // Add error handling for tiles
        tileLayer.on('tileerror', function(error) {
          console.error('❌ Primary tile loading error:', error);
          console.log('🔄 Switching to fallback tile layer...');
          map.removeLayer(tileLayer);
          fallbackTileLayer.addTo(map);
        });

        tileLayer.on('load', function() {
          console.log('✅ Tiles loaded successfully');
        });

        console.log('✅ Live map tiles added');

        // Add marker with custom icon
        const marker = L.marker(position, { icon: customIcon }).addTo(map).bindPopup('📍 KalaaLink Hub!');
        markerRef.current = marker;
        
        // Add a test circle to ensure map is working
        const testCircle = L.circle(position, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.3,
          radius: 200
        }).addTo(map);
        
        console.log('✅ Live map marker and test circle added');

        // Store map reference
        mapRef.current = map;
        setMapInitialized(true);

        // Force resize multiple times to ensure proper display
        setTimeout(() => {
          map.invalidateSize();
          console.log('✅ Live map resized (first)');
          console.log('Map container size:', map.getSize());
          console.log('Map center:', map.getCenter());
          console.log('Map zoom:', map.getZoom());
        }, 100);

        setTimeout(() => {
          map.invalidateSize();
          console.log('✅ Live map resized (second)');
        }, 500);

        setTimeout(() => {
          map.invalidateSize();
          console.log('✅ Live map resized (third)');
          console.log('Final map container size:', map.getSize());
        }, 1000);
        
      }, 100); // Wait 100ms for styles to apply

    } catch (err) {
      console.error('❌ Live map error:', err);
      setError('Failed to load map');
    }
  }, []); // Remove mapInitialized dependency to prevent re-initialization

  // Get user location and update map
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    console.log('🌍 Starting location tracking...');

    // First try to get current position with relaxed settings
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        console.log('📍 Initial location found:', newPos);
        setPosition(newPos);
        setError(null);
        
        // Update map and marker if they exist
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView(newPos, mapRef.current.getZoom());
          markerRef.current.setLatLng(newPos);
          console.log('✅ Map updated to initial location');
        }
      },
      (err) => {
        console.error('❌ Initial location error:', err);
        console.log('🔄 Trying with relaxed settings...');
        
        // Try again with more relaxed settings
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPos = [pos.coords.latitude, pos.coords.longitude];
            console.log('📍 Location found with relaxed settings:', newPos);
            setPosition(newPos);
            setError(null);
            
            if (mapRef.current && markerRef.current) {
              mapRef.current.setView(newPos, mapRef.current.getZoom());
              markerRef.current.setLatLng(newPos);
              console.log('✅ Map updated to relaxed location');
            }
          },
          (err2) => {
            console.error('❌ All location attempts failed:', err2);
            setError('Unable to retrieve your location. Please allow location access or check your browser settings.');
          },
          { 
            enableHighAccuracy: false, 
            timeout: 15000,
            maximumAge: 600000 // 10 minutes
          }
        );
      },
      { 
        enableHighAccuracy: false, 
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );

    // Then start watching for position changes
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        console.log('📍 Location updated:', newPos);
        setPosition(newPos);
        setError(null);
        
        // Update map and marker if they exist
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView(newPos, mapRef.current.getZoom());
          markerRef.current.setLatLng(newPos);
          console.log('✅ Map updated to new location');
        }
      },
      (err) => {
        console.error('❌ Watch position error:', err);
        // Don't set error for watch position failures, just log them
      },
      { 
        enableHighAccuracy: false, 
        timeout: 20000,
        maximumAge: 600000 // 10 minutes
      }
    );

    return () => {
      console.log('🛑 Stopping location tracking');
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        console.log('🧹 Cleaning up map instance...');
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
      // Clear any remaining leaflet ID from container
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }
    };
  }, []);

  return (
    <div className="live-location-map">
      <h3>📍 We are here</h3>
      {error && (
        <div className="location-error">
          <p>{error}</p>
          <button 
            onClick={requestLocation}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      )}
      <div className="map-container">
        <div 
          ref={mapContainerRef} 
          style={{ 
            height: '400px', 
            width: '100%',
            backgroundColor: '#f0f0f0'
          }}
        />
      </div>
      <div className="location-info">
        <p><strong>Current Coordinates:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
        <p><small>Your location is being tracked in real-time</small></p>
        {locationPermission === 'granted' && (
          <p style={{ color: '#28a745', fontSize: '12px', margin: '5px 0 0 0' }}>
            ✅ Location tracking active
          </p>
        )}
      </div>
    </div>
  );
}

export default LiveLocationMap;