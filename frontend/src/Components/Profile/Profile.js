import React, { useState, useEffect } from 'react';
import MainNav from '../MainNav/MainNav';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import './Profile.css';

function Profile() {
  const { user, isAuthenticated, deleteProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('booking-history');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      // Fetch user data when component mounts
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      // In a real application, you would fetch this data from your backend
      // For now, we'll use mock data
      setBookingHistory([
        {
          id: 1,
          eventName: 'Rhythm & Beats 2025',
          artistName: 'DJ Max',
          date: '2025-02-15',
          status: 'Confirmed',
          price: 1500
        },
        {
          id: 2,
          eventName: 'Dance Fusion Night',
          artistName: 'Sarah Johnson',
          date: '2025-01-20',
          status: 'Completed',
          price: 2000
        }
      ]);

      setOrderHistory([
        {
          id: 1,
          productName: 'Abstract Canvas Art',
          artistName: 'Alex Chen',
          price: 2500,
          date: '2025-01-10',
          status: 'Delivered'
        },
        {
          id: 2,
          productName: 'Custom Portrait',
          artistName: 'Maria Rodriguez',
          price: 3500,
          date: '2025-01-05',
          status: 'In Progress'
        }
      ]);

      setDonations([
        {
          id: 1,
          campaignName: 'Art for Children',
          amount: 1000,
          date: '2025-01-08',
          status: 'Completed'
        },
        {
          id: 2,
          campaignName: 'Support Local Artists',
          amount: 500,
          date: '2025-01-03',
          status: 'Completed'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div>
        <MainNav />
        <div className="profile-container">
          <div className="profile-error">
            <h2>Please log in to view your profile</h2>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'delivered':
        return '#27ae60';
      case 'in progress':
        return '#f39c12';
      case 'pending':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  // PDF Generation Function
  const generateActivityPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('My Activity Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // User Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Email: ${user.email}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Member Since: ${formatDate(user.createdAt)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Bookings Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking History', 20, yPosition);
    yPosition += 10;

    if (bookingHistory.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      bookingHistory.forEach((booking, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${index + 1}. ${booking.eventName}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Artist: ${booking.artistName}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Date: ${formatDate(booking.date)}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Status: ${booking.status}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Price: LKR ${booking.price}`, 25, yPosition);
        yPosition += 8;
      });
    } else {
      doc.text('No booking history found.', 25, yPosition);
      yPosition += 8;
    }
    yPosition += 10;

    // Orders Section
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Order History', 20, yPosition);
    yPosition += 10;

    if (orderHistory.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      orderHistory.forEach((order, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${index + 1}. ${order.productName}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Artist: ${order.artistName}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Date: ${formatDate(order.date)}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Status: ${order.status}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Price: LKR ${order.price}`, 25, yPosition);
        yPosition += 8;
      });
    } else {
      doc.text('No order history found.', 25, yPosition);
      yPosition += 8;
    }
    yPosition += 10;

    // Donations Section
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Donations', 20, yPosition);
    yPosition += 10;

    if (donations.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      donations.forEach((donation, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${index + 1}. ${donation.campaignName}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Date: ${formatDate(donation.date)}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Status: ${donation.status}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Amount: LKR ${donation.amount}`, 25, yPosition);
        yPosition += 8;
      });
    } else {
      doc.text('No donations found.', 25, yPosition);
      yPosition += 8;
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('Generated by KalaaLink', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    // Download the PDF
    doc.save(`${user.firstName}_${user.lastName}_Activity_Report.pdf`);
  };

  // Delete Profile Function
  const handleDeleteProfile = async () => {
    try {
      const result = await deleteProfile(user._id);
      if (result.success) {
        alert('Profile deleted successfully');
        navigate('/mainhome');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('An error occurred while deleting your profile');
    }
  };

  // Edit Profile Functions
  const openEditModal = () => {
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      profilePicture: user.profilePicture || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData({
      firstName: '',
      lastName: '',
      email: '',
      profilePicture: ''
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditFormData(prev => ({
          ...prev,
          profilePicture: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const result = await updateProfile(user._id, editFormData);
      if (result.success) {
        alert('Profile updated successfully');
        closeEditModal();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile');
    } finally {
      setEditLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'booking-history':
        return (
          <div className="tab-content">
            <h3>Booking History</h3>
            {bookingHistory.length > 0 ? (
              <div className="history-list">
                {bookingHistory.map((booking) => (
                  <div key={booking.id} className="history-item">
                    <div className="item-details">
                      <h4>{booking.eventName}</h4>
                      <p>Artist: {booking.artistName}</p>
                      <p>Date: {formatDate(booking.date)}</p>
                    </div>
                    <div className="item-status">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </span>
                      <span className="price">LKR {booking.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No booking history found.</p>
            )}
          </div>
        );

      case 'order-history':
        return (
          <div className="tab-content">
            <h3>Order History</h3>
            {orderHistory.length > 0 ? (
              <div className="history-list">
                {orderHistory.map((order) => (
                  <div key={order.id} className="history-item">
                    <div className="item-details">
                      <h4>{order.productName}</h4>
                      <p>Artist: {order.artistName}</p>
                      <p>Date: {formatDate(order.date)}</p>
                    </div>
                    <div className="item-status">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                      <span className="price">LKR {order.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No order history found.</p>
            )}
          </div>
        );

      case 'donations':
        return (
          <div className="tab-content">
            <h3>Donations</h3>
            {donations.length > 0 ? (
              <div className="history-list">
                {donations.map((donation) => (
                  <div key={donation.id} className="history-item">
                    <div className="item-details">
                      <h4>{donation.campaignName}</h4>
                      <p>Date: {formatDate(donation.date)}</p>
                    </div>
                    <div className="item-status">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(donation.status) }}
                      >
                        {donation.status}
                      </span>
                      <span className="price">LKR {donation.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No donations found.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <MainNav />
      <div className="profile-container">
        <div className="profile-wrapper">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" />
                ) : (
                  <div className="default-avatar">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>{user.firstName} {user.lastName}</h2>
                <p>{user.email}</p>
                <p className="member-since">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="profile-actions">
              <button 
                className="action-btn edit-btn"
                onClick={openEditModal}
              >
                ✏️ Edit Profile
              </button>
              <button 
                className="action-btn pdf-btn"
                onClick={generateActivityPDF}
              >
                📄 Download My Activity PDF
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ Delete Profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <div className="tabs-container">
              <button
                className={`tab-button ${activeTab === 'booking-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('booking-history')}
              >
                Booking History
              </button>
              <button
                className={`tab-button ${activeTab === 'order-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('order-history')}
              >
                Order History
              </button>
              <button
                className={`tab-button ${activeTab === 'donations' ? 'active' : ''}`}
                onClick={() => setActiveTab('donations')}
              >
                Donations
              </button>
            </div>
            
            <div className="tabs-content">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : (
                renderTabContent()
              )}
            </div>
          </div>
        </div>
        
        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content edit-modal">
              <h3>✏️ Edit Profile</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-input"
                    value={editFormData.firstName}
                    onChange={handleEditInputChange}
                    required
                    disabled={editLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-input"
                    value={editFormData.lastName}
                    onChange={handleEditInputChange}
                    required
                    disabled={editLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                    disabled={editLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
                  <div className="profile-picture-upload">
                    {editFormData.profilePicture && (
                      <div className="profile-picture-preview">
                        <img src={editFormData.profilePicture} alt="Profile Preview" />
                      </div>
                    )}
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      disabled={editLoading}
                      className="file-input"
                    />
                    <label htmlFor="profilePicture" className="file-input-label">
                      📷 Choose Profile Picture
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button"
                    className="modal-btn cancel-btn"
                    onClick={closeEditModal}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="modal-btn save-btn"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>⚠️ Delete Profile Confirmation</h3>
              <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
              <p>This will permanently remove:</p>
              <ul>
                <li>Your account and personal information</li>
                <li>All booking history</li>
                <li>All order history</li>
                <li>All donation records</li>
              </ul>
              <div className="modal-actions">
                <button 
                  className="modal-btn cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="modal-btn confirm-delete-btn"
                  onClick={handleDeleteProfile}
                >
                  Yes, Delete My Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
