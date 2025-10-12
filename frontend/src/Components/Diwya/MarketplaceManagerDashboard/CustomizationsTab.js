import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { sendStatusChangeEmail } from '../../../utils/sendCustomizationStatusEmail';

const CUSTOMIZATION_URL = 'http://localhost:5000/api/customizations';

function CustomizationsTab({ customizations }) {
  const [customizationsList, setCustomizationsList] = useState(Array.isArray(customizations) ? customizations : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomizations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(CUSTOMIZATION_URL);
      // Handle the API response format: { success: true, data: customizations }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setCustomizationsList(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        setCustomizationsList(response.data);
      } else {
        console.warn('Unexpected API response format:', response.data);
        setCustomizationsList([]);
      }
    } catch (err) {
      console.error('Error fetching customizations:', err);
      setError('Failed to fetch customizations. Please try again later.');
      setCustomizationsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch fresh data on component mount
    fetchCustomizations();
  }, []);

  // Update local state when customizations prop changes
  useEffect(() => {
    if (Array.isArray(customizations)) {
      setCustomizationsList(customizations);
    }
  }, [customizations]);

  const handleDeleteCustomization = async (customizationId) => {
    if (window.confirm('Are you sure you want to delete this customization request?')) {
      try {
        await axios.delete(`${CUSTOMIZATION_URL}/${customizationId}`);
        setCustomizationsList(prev => prev.filter(c => c._id !== customizationId));
        alert('Customization request deleted successfully!');
      } catch (error) {
        console.error('Error deleting customization:', error);
        alert('Failed to delete customization request. Please try again.');
      }
    }
  };

  const handleUpdateStatus = async (customizationId, newStatus) => {
    try {
      // Find the customization to get customer details
      const customization = customizationsList.find(c => c._id === customizationId);
      
      // Update status in backend
      await axios.put(`${CUSTOMIZATION_URL}/${customizationId}`, {
        status: newStatus
      });
      
      // Update local state
      setCustomizationsList(prev => prev.map(c => 
        c._id === customizationId ? { ...c, status: newStatus } : c
      ));
      
      // Send email notification if status is "in-progress" or "completed"
      if (customization && (newStatus === 'in-progress' || newStatus === 'completed')) {
        try {
          await sendStatusChangeEmail(
            newStatus, 
            customization.customerEmail, 
            customization.customerName
          );
          console.log(`Email notification sent for ${newStatus} status to ${customization.customerEmail}`);
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the status update if email fails
        }
      }
      
      alert(`Customization status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating customization status:', error);
      alert('Failed to update customization status. Please try again.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge status-pending';
      case 'in-progress': return 'status-badge status-in-progress';
      case 'completed': return 'status-badge status-completed';
      case 'cancelled': return 'status-badge status-cancelled';
      default: return 'status-badge status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <div className="loading-container"><p>Loading customizations...</p></div>;
  if (error) return <div className="error-container"><p>{error}</p><button onClick={fetchCustomizations}>Retry</button></div>;

  // Ensure customizationsList is always an array
  const safeCustomizationsList = Array.isArray(customizationsList) ? customizationsList : [];
  
  // Debug logging
  console.log('CustomizationsTab - safeCustomizationsList:', safeCustomizationsList);
  console.log('CustomizationsTab - customizations prop:', customizations);

  return (
    <div className="customizations-container">
      {/* Header */}
      <div className="customizations-header">
        <div className="customizations-title-section">
          <h2>Customization Requests</h2>
          <p>Manage and track all product customization requests.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-refresh" onClick={fetchCustomizations}>Refresh</button>
        </div>
      </div>

      {/* Customizations List */}
      {safeCustomizationsList.length === 0 ? (
        <div className="no-customizations">
          <p>No customization requests found.</p>
        </div>
      ) : (
        <div className="customizations-table-container">
          <table className="customizations-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Art Type</th>
                <th>Description</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeCustomizationsList.map((customization) => (
                <tr key={customization._id}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{customization.customerName || 'N/A'}</div>
                      <div className="customer-email">{customization.customerEmail || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{customization.preferredArtType || 'N/A'}</td>
                  <td className="description-cell">
                    <div className="description-text">
                      {customization.description || 'No description provided'}
                    </div>
                  </td>
                  <td>
                    {customization.budget ? `LKR ${customization.budget.toLocaleString()}` : 'N/A'}
                  </td>
                  <td>
                    <span className={getStatusClass(customization.status)}>
                      {customization.status || 'pending'}
                    </span>
                  </td>
                  <td>{formatDate(customization.createdAt)}</td>
                  <td>
                    <div className="customization-actions">
                      <select
                        value={customization.status || 'pending'}
                        onChange={(e) => handleUpdateStatus(customization._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        className="btn btn-clear-black"
                        onClick={() => handleDeleteCustomization(customization._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomizationsTab;
