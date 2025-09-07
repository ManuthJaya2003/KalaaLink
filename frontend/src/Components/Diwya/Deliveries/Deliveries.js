import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './Deliveries.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different delivery statuses
const deliveryIcons = {
  Pending: L.divIcon({
    className: 'custom-delivery-marker',
    html: '<div style="background-color: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">⏳</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
  Dispatched: L.divIcon({
    className: 'custom-delivery-marker',
    html: '<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🚚</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
  'In Transit': L.divIcon({
    className: 'custom-delivery-marker',
    html: '<div style="background-color: #8b5cf6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🚛</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
  Delivered: L.divIcon({
    className: 'custom-delivery-marker',
    html: '<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">✅</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
  Failed: L.divIcon({
    className: 'custom-delivery-marker',
    html: '<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">❌</div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
};

// Component to handle map view updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng && map) {
      try {
        map.setView(center, zoom);
      } catch (error) {
        console.error('Error updating map view:', error);
      }
    }
  }, [center, zoom, map]);
  
  return null;
}

// Separate component for the delivery map to ensure proper initialization
function DeliveryMap({ delivery, isVisible }) {
  const [mapKey, setMapKey] = useState(0);
  const [mapError, setMapError] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      // Force re-render of the map when modal becomes visible
      setMapKey(prev => prev + 1);
      setMapError(false);
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  const mapCenter = delivery.coordinates || { lat: 6.9271, lng: 79.8612 };
  
  if (mapError) {
    return (
      <div className="map-container" style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>🗺️ Map temporarily unavailable</p>
          <p style={{ fontSize: '14px' }}>Address: {delivery.address}, {delivery.city}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="map-container">
      <MapContainer
        key={`delivery-map-${delivery._id}-${mapKey}`}
        center={mapCenter}
        zoom={15}
        style={{ height: '400px', width: '100%' }}
        whenReady={() => {
          console.log('Delivery map is ready');
        }}
        eventHandlers={{
          error: () => {
            console.error('Map error occurred');
            setMapError(true);
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {delivery.coordinates && (
          <Marker 
            position={delivery.coordinates} 
            icon={deliveryIcons[delivery.deliveryStatus] || deliveryIcons.Pending}
          >
            <Popup>
              <div>
                <h4>🚚 Delivery Location</h4>
                <p><strong>Customer:</strong> {delivery.customerName}</p>
                <p><strong>Product:</strong> {delivery.productName || delivery.artId?.artType}</p>
                <p><strong>Status:</strong> {delivery.deliveryStatus}</p>
                <p><strong>Address:</strong> {delivery.address}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        <MapUpdater center={mapCenter} zoom={15} />
      </MapContainer>
    </div>
  );
}

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dispatchModal, setDispatchModal] = useState({ isOpen: false, delivery: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, delivery: null });
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api/deliveries';

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, statsRes] = await Promise.all([
        axios.get(API_BASE_URL),
        axios.get(`${API_BASE_URL}/stats/overview`)
      ]);
      setDeliveries(deliveriesRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching deliveries:', err);
      setError('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    // Refresh deliveries every 30 seconds
    const interval = setInterval(fetchDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async (deliveryId) => {
    try {
      await axios.post(`${API_BASE_URL}/${deliveryId}/dispatch`, {
        notes: dispatchNotes
      });
      
      setDispatchModal({ isOpen: false, delivery: null });
      setDispatchNotes('');
      await fetchDeliveries();
      
      // Show success message
      alert('Delivery dispatched successfully!');
    } catch (err) {
      console.error('Error dispatching delivery:', err);
      alert('Failed to dispatch delivery');
    }
  };

  const handleStatusUpdate = async (deliveryId) => {
    try {
      await axios.put(`${API_BASE_URL}/${deliveryId}/status`, {
        status: statusUpdate.status,
        notes: statusUpdate.notes
      });
      
      setStatusModal({ isOpen: false, delivery: null });
      setStatusUpdate({ status: '', notes: '' });
      await fetchDeliveries();
      
      // Show success message
      alert('Delivery status updated successfully!');
    } catch (err) {
      console.error('Error updating delivery status:', err);
      alert('Failed to update delivery status');
    }
  };

  const handleClearCompleted = async () => {
    setClearing(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/clear-completed`);
      
      await fetchDeliveries();
      setShowClearModal(false);
      alert(`Successfully cleared ${response.data.deletedCount} completed deliveries!`);
    } catch (err) {
      console.error('Error clearing deliveries:', err);
      alert('Failed to clear deliveries');
    } finally {
      setClearing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Pending: '#f59e0b',
      Dispatched: '#3b82f6',
      'In Transit': '#8b5cf6',
      Delivered: '#10b981',
      Failed: '#ef4444'
    };

    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: statusColors[status] || '#6b7280' }}
      >
        {status}
      </span>
    );
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    return delivery.deliveryStatus === filter;
  });
  

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=lk`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
    // Return default coordinates for Sri Lanka if geocoding fails
    return { lat: 6.9271, lng: 79.8612 };
  };

  const handleShowMap = async (delivery) => {
    setSelectedDelivery(delivery);
    
    // Try to geocode the address if coordinates are not available
    if (!delivery.coordinates || !delivery.coordinates.lat) {
      const fullAddress = `${delivery.address}, ${delivery.city}, ${delivery.district}`;
      const coords = await geocodeAddress(fullAddress);
      if (coords) {
        delivery.coordinates = coords;
      }
    }
    
    // Add a small delay to ensure the modal is rendered before showing the map
    setTimeout(() => {
      setShowMap(true);
    }, 100);
  };


  if (loading) {
    return (
      <div className="deliveries-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deliveries-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchDeliveries} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="deliveries-container">
      {/* Header */}
      <div className="deliveries-header">
        <h2>Delivery Management</h2>
        <p>Manage and track all delivery orders</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Deliveries</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card dispatched">
            <div className="stat-icon">🚚</div>
            <div className="stat-content">
              <h3>{stats.dispatched}</h3>
              <p>Dispatched</p>
            </div>
          </div>
          <div className="stat-card delivered">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.delivered}</h3>
              <p>Delivered</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({deliveries.length})
          </button>
          <button 
            className={filter === 'Pending' ? 'active' : ''}
            onClick={() => setFilter('Pending')}
          >
            Pending ({stats?.pending || 0})
          </button>
          <button 
            className={filter === 'Dispatched' ? 'active' : ''}
            onClick={() => setFilter('Dispatched')}
          >
            Dispatched ({stats?.dispatched || 0})
          </button>
          <button 
            className={filter === 'Delivered' ? 'active' : ''}
            onClick={() => setFilter('Delivered')}
          >
            Delivered ({stats?.delivered || 0})
          </button>
        </div>
        
        {/* Clear Button */}
        <div className="clear-section">
          <button 
            className="clear-button"
            onClick={() => setShowClearModal(true)}
            disabled={!stats?.delivered || stats.delivered === 0}
          >
            🧹 Clear Completed ({stats?.delivered || 0})
          </button>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="deliveries-list">
        {filteredDeliveries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No deliveries found</h3>
            <p>No deliveries match the current filter.</p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div key={delivery._id} className="delivery-card">
              
              <div className="delivery-header">
                <div className="delivery-info">
                  <h3>{delivery.productName || delivery.artId?.artType || 'Unknown Product'}</h3>
                  <p className="customer-name">{delivery.customerName}</p>
                  <p className="delivery-address">
                    📍 {delivery.address}, {delivery.city}, {delivery.district}
                  </p>
                </div>
                <div className="delivery-status">
                  {getStatusBadge(delivery.deliveryStatus)}
                </div>
              </div>

              <div className="delivery-details">
                <div className="detail-row">
                  <span className="label">Order ID:</span>
                  <span className="value">{delivery.orderId?._id || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Customer Email:</span>
                  <span className="value">{delivery.customerEmail || delivery.orderId?.customerEmail || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Contact:</span>
                  <span className="value">{delivery.contactNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{delivery.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(delivery.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {delivery.dispatchedAt && (
                  <div className="detail-row">
                    <span className="label">Dispatched:</span>
                    <span className="value">
                      {new Date(delivery.dispatchedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {delivery.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{delivery.notes}</span>
                  </div>
                )}
              </div>

              <div className="delivery-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleShowMap(delivery)}
                >
                  🗺️ View Map
                </button>
                
                {delivery.deliveryStatus === 'Pending' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setDispatchModal({ isOpen: true, delivery })}
                  >
                    🚚 Dispatch
                  </button>
                )}
                
                <button 
                  className="btn btn-outline"
                  onClick={() => setStatusModal({ isOpen: true, delivery })}
                >
                  📝 Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Map Modal */}
      {showMap && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowMap(false)}>
          <div className="modal-content map-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delivery Location - {selectedDelivery.customerName}</h3>
              <button className="modal-close" onClick={() => setShowMap(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="delivery-map-info">
                <p><strong>Address:</strong> {selectedDelivery.address}, {selectedDelivery.city}, {selectedDelivery.district}</p>
                <p><strong>Contact:</strong> {selectedDelivery.contactNumber}</p>
                <p><strong>Product:</strong> {selectedDelivery.productName || selectedDelivery.artId?.artType}</p>
                {!selectedDelivery.coordinates && (
                  <p style={{ color: '#f59e0b', fontSize: '14px' }}>
                    ⚠️ Exact coordinates not available - showing approximate location
                  </p>
                )}
              </div>
              
              <DeliveryMap delivery={selectedDelivery} isVisible={showMap} />
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDispatchModal({ isOpen: false, delivery: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dispatch Delivery</h3>
              <button className="modal-close" onClick={() => setDispatchModal({ isOpen: false, delivery: null })}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="dispatch-info">
                <p><strong>Customer:</strong> {dispatchModal.delivery?.customerName}</p>
                <p><strong>Product:</strong> {dispatchModal.delivery?.productName || dispatchModal.delivery?.artId?.artType}</p>
                <p><strong>Address:</strong> {dispatchModal.delivery?.address}, {dispatchModal.delivery?.city}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="dispatchNotes">Dispatch Notes (Optional):</label>
                <textarea
                  id="dispatchNotes"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="Add any notes for the delivery..."
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setDispatchModal({ isOpen: false, delivery: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleDispatch(dispatchModal.delivery._id)}
                >
                  🚚 Dispatch Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal.isOpen && (
        <div className="modal-overlay" onClick={() => setStatusModal({ isOpen: false, delivery: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Delivery Status</h3>
              <button className="modal-close" onClick={() => setStatusModal({ isOpen: false, delivery: null })}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="statusSelect">New Status:</label>
                <select
                  id="statusSelect"
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="statusNotes">Notes (Optional):</label>
                <textarea
                  id="statusNotes"
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  placeholder="Add any notes about the status update..."
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setStatusModal({ isOpen: false, delivery: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleStatusUpdate(statusModal.delivery._id)}
                  disabled={!statusUpdate.status}
                >
                  📝 Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🧹 Clear Completed Deliveries</h3>
              <button className="modal-close" onClick={() => setShowClearModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="clear-warning">
                <p><strong>⚠️ Warning:</strong> This action will permanently delete all completed and failed deliveries.</p>
                <p>This includes:</p>
                <ul>
                  <li>✅ Delivered orders</li>
                  <li>❌ Failed deliveries</li>
                </ul>
                <p><strong>This action cannot be undone!</strong></p>
              </div>
              
              <div className="clear-stats">
                <p>Deliveries to be cleared: <strong>{stats?.delivered || 0}</strong></p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
              >
                Cancel
              </button>
              <button 
                className="btn-clear"
                onClick={handleClearCompleted}
                disabled={clearing}
              >
                {clearing ? 'Clearing...' : 'Clear Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deliveries;
