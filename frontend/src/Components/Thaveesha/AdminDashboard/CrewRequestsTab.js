import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CrewRequestsTab.css';

const API_URL = 'http://localhost:5000/api/crew-requests';

function CrewRequestsTab() {
  const [crewRequests, setCrewRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearStatus, setClearStatus] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [showIndividualDeleteConfirm, setShowIndividualDeleteConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch crew requests
  const fetchCrewRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setCrewRequests(response.data);
    } catch (error) {
      console.error('Error fetching crew requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrewRequests();
  }, []);

  // Filter crew requests based on status
  const filteredRequests = crewRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  // Handle status update
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const adminName = JSON.parse(localStorage.getItem('employee'))?.name || 'Admin';
      
      await axios.patch(`${API_URL}/${requestId}/status`, {
        status: newStatus,
        reviewedBy: adminName,
        adminNotes: adminNotes
      });

      // Update local state
      setCrewRequests(prev => 
        prev.map(req => 
          req._id === requestId 
            ? { ...req, status: newStatus, reviewedAt: new Date(), reviewedBy: adminName, adminNotes }
            : req
        )
      );

      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      
      alert(`Crew request ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating crew request status:', error);
      alert('Failed to update crew request status');
    }
  };

  // Open modal for status update
  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setShowModal(true);
  };

  // Handle clear requests by status
  const handleClearRequests = (status) => {
    setClearStatus(status);
    setShowClearConfirm(true);
  };

  // Confirm and execute clear operation
  const confirmClearRequests = async () => {
    if (!clearStatus) return;

    setIsClearing(true);
    try {
      // Get all requests with the specified status
      const requestsToDelete = crewRequests.filter(req => req.status === clearStatus);
      
      if (requestsToDelete.length === 0) {
        alert(`No ${clearStatus} requests to clear.`);
        setShowClearConfirm(false);
        setClearStatus('');
        setIsClearing(false);
        return;
      }

      // Delete each request
      const deletePromises = requestsToDelete.map(req => 
        axios.delete(`${API_URL}/${req._id}`)
      );

      await Promise.all(deletePromises);

      // Update local state
      setCrewRequests(prev => prev.filter(req => req.status !== clearStatus));
      
      alert(`Successfully cleared ${requestsToDelete.length} ${clearStatus} crew request(s).`);
    } catch (error) {
      console.error('Error clearing crew requests:', error);
      alert('Failed to clear crew requests. Please try again.');
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
      setClearStatus('');
    }
  };

  // Cancel clear operation
  const cancelClearRequests = () => {
    setShowClearConfirm(false);
    setClearStatus('');
  };

  // Handle individual delete request
  const handleIndividualDelete = (request) => {
    setRequestToDelete(request);
    setShowIndividualDeleteConfirm(true);
  };

  // Confirm and execute individual delete
  const confirmIndividualDelete = async () => {
    if (!requestToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/${requestToDelete._id}`);

      // Update local state
      setCrewRequests(prev => prev.filter(req => req._id !== requestToDelete._id));
      
      alert(`Successfully deleted crew request for "${requestToDelete.eventId?.eventTitle}".`);
    } catch (error) {
      console.error('Error deleting crew request:', error);
      alert('Failed to delete crew request. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowIndividualDeleteConfirm(false);
      setRequestToDelete(null);
    }
  };

  // Cancel individual delete operation
  const cancelIndividualDelete = () => {
    setShowIndividualDeleteConfirm(false);
    setRequestToDelete(null);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  // Get crew type display name
  const getCrewTypeDisplay = (crewType) => {
    const typeMap = {
      'sound': 'Sound System',
      'lighting': 'Lighting',
      'stage_setup': 'Stage Setup',
      'security': 'Security',
      'catering': 'Catering',
      'photography': 'Photography',
      'transportation': 'Transportation',
      'other': 'Other'
    };
    return typeMap[crewType] || crewType;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="crew-requests-loading">
        <div className="loading-spinner"></div>
        <p>Loading crew requests...</p>
      </div>
    );
  }

  return (
    <div className="crew-requests-tab">
      <div className="tab-header">
        <h2>👷 Crew Requests Management</h2>
        <p>Review and manage crew requests from event managers</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({crewRequests.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({crewRequests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({crewRequests.filter(r => r.status === 'approved').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({crewRequests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Clear Buttons */}
      {filter !== 'all' && (
        <div className="clear-section">
          <div className="clear-info">
            <span className="clear-label">
              Clear all {filter} requests ({crewRequests.filter(r => r.status === filter).length})
            </span>
            <button 
              className="clear-button"
              onClick={() => handleClearRequests(filter)}
              disabled={crewRequests.filter(r => r.status === filter).length === 0}
            >
              🗑️ Clear {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          </div>
        </div>
      )}

      {/* Crew Requests List */}
      <div className="crew-requests-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <div className="no-requests-icon">📋</div>
            <h3>No crew requests found</h3>
            <p>No crew requests match the current filter.</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request._id} className="crew-request-card">
              <div className="request-header">
                <div className="request-info">
                  <h3 className="event-title">{request.eventId?.eventTitle || 'Event Not Found'}</h3>
                  <p className="event-details">
                    📅 {formatDate(request.eventId?.eventDate)} at {formatTime(request.eventId?.eventTime)}
                    <br />
                    📍 {request.eventId?.eventVenue}
                  </p>
                </div>
                <div className="request-status">
                  <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">👷 Crew Type:</span>
                  <span className="detail-value">{getCrewTypeDisplay(request.crewType)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📝 Details:</span>
                  <span className="detail-value">{request.crewDetails}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Required Date:</span>
                  <span className="detail-value">{formatDate(request.requiredDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">⏰ Required Time:</span>
                  <span className="detail-value">{formatTime(request.requiredTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">⏱️ Duration:</span>
                  <span className="detail-value">{request.estimatedDuration}</span>
                </div>
                {request.specialRequirements && (
                  <div className="detail-row">
                    <span className="detail-label">⭐ Special Requirements:</span>
                    <span className="detail-value">{request.specialRequirements}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">👤 Requested By:</span>
                  <span className="detail-value">{request.requestedBy}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Requested At:</span>
                  <span className="detail-value">{formatDate(request.requestedAt)}</span>
                </div>
                {request.reviewedAt && (
                  <div className="detail-row">
                    <span className="detail-label">👤 Reviewed By:</span>
                    <span className="detail-value">{request.reviewedBy}</span>
                  </div>
                )}
                {request.adminNotes && (
                  <div className="detail-row">
                    <span className="detail-label">📝 Admin Notes:</span>
                    <span className="detail-value">{request.adminNotes}</span>
                  </div>
                )}
              </div>

              <div className="request-actions">
                {request.status === 'pending' && (
                  <>
                    <button 
                      className="action-button approve-button"
                      onClick={() => openStatusModal(request)}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="action-button reject-button"
                      onClick={() => openStatusModal(request)}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
                <button 
                  className="action-button delete-button"
                  onClick={() => handleIndividualDelete(request)}
                  title="Delete this crew request"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Update Modal */}
      {showModal && selectedRequest && (
        <div className="status-modal">
          <div className="status-modal-content">
            <div className="modal-header">
              <h3>Update Crew Request Status</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p><strong>Event:</strong> {selectedRequest.eventId?.eventTitle}</p>
              <p><strong>Crew Type:</strong> {getCrewTypeDisplay(selectedRequest.crewType)}</p>
              
              <div className="form-group">
                <label>Admin Notes (Optional):</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="action-button approve-button"
                onClick={() => handleStatusUpdate(selectedRequest._id, 'approved')}
              >
                ✅ Approve Request
              </button>
              <button 
                className="action-button reject-button"
                onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
              >
                ❌ Reject Request
              </button>
              <button 
                className="action-button cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="clear-confirm-modal">
          <div className="clear-confirm-content">
            <div className="modal-header">
              <h3>⚠️ Confirm Clear Operation</h3>
              <button className="close-button" onClick={cancelClearRequests}>×</button>
            </div>
            
            <div className="modal-body">
              <p><strong>Are you sure you want to clear all {clearStatus} crew requests?</strong></p>
              <p>This action will permanently delete <strong>{crewRequests.filter(r => r.status === clearStatus).length}</strong> crew request(s) from the database.</p>
              <p className="warning-text">⚠️ This action cannot be undone!</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="action-button clear-confirm-button"
                onClick={confirmClearRequests}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <span className="spinner"></span>
                    Clearing...
                  </>
                ) : (
                  <>
                    🗑️ Yes, Clear All {clearStatus.charAt(0).toUpperCase() + clearStatus.slice(1)}
                  </>
                )}
              </button>
              <button 
                className="action-button cancel-button"
                onClick={cancelClearRequests}
                disabled={isClearing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Delete Confirmation Modal */}
      {showIndividualDeleteConfirm && requestToDelete && (
        <div className="individual-delete-modal">
          <div className="individual-delete-content">
            <div className="modal-header">
              <h3>⚠️ Confirm Delete</h3>
              <button className="close-button" onClick={cancelIndividualDelete}>×</button>
            </div>
            
            <div className="modal-body">
              <p><strong>Are you sure you want to delete this crew request?</strong></p>
              <div className="delete-details">
                <p><strong>Event:</strong> {requestToDelete.eventId?.eventTitle}</p>
                <p><strong>Crew Type:</strong> {getCrewTypeDisplay(requestToDelete.crewType)}</p>
                <p><strong>Status:</strong> {requestToDelete.status.charAt(0).toUpperCase() + requestToDelete.status.slice(1)}</p>
                <p><strong>Requested By:</strong> {requestToDelete.requestedBy}</p>
              </div>
              <p className="warning-text">⚠️ This action cannot be undone!</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="action-button delete-confirm-button"
                onClick={confirmIndividualDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    🗑️ Yes, Delete Request
                  </>
                )}
              </button>
              <button 
                className="action-button cancel-button"
                onClick={cancelIndividualDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrewRequestsTab;
