// Geocoding service using OpenStreetMap Nominatim
// This service converts venue addresses to coordinates

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Get coordinates for common Sri Lankan venues
export const getCommonVenueCoordinates = (venueName) => {
  const commonVenues = {
    'colombo': { lat: 6.9271, lng: 79.8612 },
    'kandy': { lat: 7.2906, lng: 80.6337 },
    'galle': { lat: 6.0535, lng: 80.2210 },
    'jaffna': { lat: 9.6615, lng: 80.0255 },
    'anuradhapura': { lat: 8.3114, lng: 80.4037 },
    'trincomalee': { lat: 8.5711, lng: 81.2335 },
    'batticaloa': { lat: 7.7167, lng: 81.7000 },
    'kurunegala': { lat: 7.4863, lng: 80.3623 },
    'ratnapura': { lat: 6.6828, lng: 80.3990 },
    'badulla': { lat: 6.9934, lng: 81.0550 }
  };
  
  // Check if venue name contains any common city names
  const venueLower = venueName.toLowerCase();
  for (const [city, coords] of Object.entries(commonVenues)) {
    if (venueLower.includes(city)) {
      return coords;
    }
  }
  
  return null;
};

// Enhanced geocoding that tries common venues first, then falls back to Nominatim
export const getVenueCoordinates = async (venueAddress) => {
  // First try common venues
  const commonCoords = getCommonVenueCoordinates(venueAddress);
  if (commonCoords) {
    return commonCoords;
  }
  
  // Fall back to geocoding service
  const geocoded = await geocodeAddress(venueAddress);
  if (geocoded) {
    return {
      lat: geocoded.latitude,
      lng: geocoded.longitude
    };
  }
  
  // Default to Colombo if all else fails
  return { lat: 6.9271, lng: 79.8612 };
};
