import React, { useState, useEffect } from "react";
import axios from "axios";
import emailjs from 'emailjs-com';
import './ComplaintsTab.css';

const API_URL = "http://localhost:5000/complaints";

function ComplaintsTab() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Fetch complaints from backend
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setComplaints(response.data.complaints || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  // Filter complaints based on status
  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    if (filter === 'pending') return complaint.status === 'Pending';
    if (filter === 'accepted') return complaint.status === 'Accepted';
    if (filter === 'rejected') return complaint.status === 'Rejected';
    return true;
  });

  // Calculate statistics
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Accepted').length;

  // Handle status update
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await axios.put(`${API_URL}/${complaintId}`, { status: newStatus });
      
      // Update local state
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
      
      // Send email notification if complaint is accepted
      if (newStatus === 'Accepted') {
        const complaint = complaints.find(c => c._id === complaintId);
        if (complaint) {
          emailjs.send(
            "service_1uxn9p8",
            "template_sojpjz3",
            {
              user_name: complaint.Name,
              user_email: complaint.Gmail,
              complaint_id: complaint._id,
              complaint_subject: complaint.Complaint_Category,
              complaint_message: complaint.Message
            },
            "Iyq-2jKYLb9Tri5Qd"
          )
          .then((result) => {
            console.log("✅ Resolution email sent successfully:", result.text);
          })
          .catch((error) => {
            console.error("❌ Failed to send resolution email:", error);
          });
        }
      }
      
      setShowModal(false);
      setSelectedComplaint(null);
    } catch (err) {
      console.error('Error updating complaint status:', err);
      alert('Failed to update complaint status');
    }
  };

  // Handle bulk clear complaints
  const handleBulkClear = async () => {
    try {
      setClearing(true);
      const statusMap = {
        'pending': 'Pending',
        'accepted': 'Accepted',
        'rejected': 'Rejected'
      };
      
      const status = statusMap[filter];
      const response = await axios.post(`${API_URL}/bulk-clear`, { status });
      
      // Refresh complaints list
      await fetchComplaints();
      
      alert(response.data.message);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Error clearing complaints:', err);
      alert('Failed to clear complaints');
    } finally {
      setClearing(false);
    }
  };

  // Get filter display name
  const getFilterDisplayName = () => {
    switch (filter) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return '';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Accepted': return 'status-accepted';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="complaints-tab">
        <div className="section-header">
          <h1>Complaints Management</h1>
          <p className="section-subtitle">Review and manage customer complaints and feedback</p>
        </div>
        <div className="loading-container">
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="complaints-tab">
      <div className="section-header">
        <h1>Complaints Management</h1>
        <p className="section-subtitle">Review and manage customer complaints and feedback</p>
      </div>
      
      <div className="complaints-content">
        <div className="complaints-stats">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Complaints</h3>
            </div>
            <div className="stat-value">{totalComplaints}</div>
            <div className="stat-label">All time</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Pending</h3>
            </div>
            <div className="stat-value">{pendingComplaints}</div>
            <div className="stat-label">Awaiting review</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Resolved</h3>
            </div>
            <div className="stat-value">{resolvedComplaints}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="complaints-filters">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({totalComplaints})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingComplaints})
            </button>
            <button 
              className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
              onClick={() => setFilter('accepted')}
            >
              Accepted ({resolvedComplaints})
            </button>
            <button 
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({complaints.filter(c => c.status === 'Rejected').length})
            </button>
          </div>
          
          {/* Clear Button - Only show when a specific filter is active */}
          {filter !== 'all' && filteredComplaints.length > 0 && (
            <div className="clear-section">
              <button 
                className="clear-btn"
                onClick={() => setShowClearConfirm(true)}
                disabled={clearing}
              >
                {clearing ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          )}
        </div>

        <div className="complaints-list">
          {error ? (
            <div className="error-message">
              <h3>Error loading complaints</h3>
              <p>{error}</p>
              <button onClick={fetchComplaints} className="retry-btn">
                Retry
              </button>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="no-complaints">
              <h3>No complaints found</h3>
              <p>There are currently no customer complaints to review for the selected filter.</p>
            </div>
          ) : (
            <div className="complaints-table">
              <table className="complaints-table-content">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td>{complaint.Name}</td>
                      <td>{complaint.Gmail}</td>
                      <td>{complaint.Complaint_Category}</td>
                      <td className="message-cell">
                        <div className="message-preview">
                          {complaint.Message.length > 100 
                            ? `${complaint.Message.substring(0, 100)}...` 
                            : complaint.Message
                          }
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td>{formatDate(complaint.createdAt || complaint.updatedAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowModal(true);
                            }}
                          >
                            View
                          </button>
                          {complaint.status === 'Pending' && (
                            <>
                              <button 
                                className="action-btn accept-btn"
                                onClick={() => handleStatusUpdate(complaint._id, 'Accepted')}
                              >
                                Accept
                              </button>
                              <button 
                                className="action-btn reject-btn"
                                onClick={() => handleStatusUpdate(complaint._id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Complaint Details Modal */}
      {showModal && selectedComplaint && (
        <div className="complaint-modal">
          <div className="complaint-modal-content">
            <div className="modal-header">
              <h3>Complaint Details</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="complaint-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedComplaint.Name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedComplaint.Gmail}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedComplaint.Complaint_Category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Message:</span>
                  <div className="message-content">
                    {selectedComplaint.Message}
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {formatDate(selectedComplaint.createdAt || selectedComplaint.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedComplaint.status === 'Pending' && (
                <>
                  <button 
                    className="action-btn accept-btn"
                    onClick={() => handleStatusUpdate(selectedComplaint._id, 'Accepted')}
                  >
                    Accept
                  </button>
                  <button 
                    className="action-btn reject-btn"
                    onClick={() => handleStatusUpdate(selectedComplaint._id, 'Rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
              <button 
                className="action-btn close-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="complaint-modal">
          <div className="complaint-modal-content">
            <div className="modal-header">
              <h3>Confirm Clear Action</h3>
              <button className="close-button" onClick={() => setShowClearConfirm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="confirmation-message">
                <p>
                  Are you sure you want to clear all <strong>{getFilterDisplayName().toLowerCase()}</strong> complaints?
                </p>
                <p className="warning-text">
                  This action will permanently delete <strong>{filteredComplaints.length}</strong> complaint(s) from the database and cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="action-btn clear-confirm-btn"
                onClick={handleBulkClear}
                disabled={clearing}
              >
                {clearing ? 'Clearing...' : 'Yes, Clear All'}
              </button>
              <button 
                className="action-btn cancel-btn"
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
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

export default ComplaintsTab;
