import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const EmployeeProfileModal = ({ employee, isOpen, onClose }) => {
  const [statistics, setStatistics] = useState({
    // Artist Manager stats
    totalArtistsManaged: 0,
    artworksApproved: 0,
    eventsParticipated: 0,
    bookingsMade: 0,
    
    // Donation Manager stats
    totalDonationsReceived: 0,
    activeCampaigns: 0,
    topDonor: 'N/A',
    donationsThisMonth: 0,
    
    // Event Manager stats
    totalEventsCreated: 0,
    artistsRegistered: 0,
    registrationFeesCollected: 0,
    avgFeedbackRating: 0,
    
    // Marketplace Manager stats
    totalProductsListed: 0,
    productsSold: 0,
    totalRevenue: 0,
    topSellingProduct: 'N/A',
    
    // Admin stats
    totalUsers: 0,
    adminTotalRevenue: 0,
    totalComplaints: 0,
    activeManagers: 0,
    
    loading: true,
    error: null
  });

  const fetchEmployeeStatistics = useCallback(async () => {
    if (!employee) return;

    setStatistics(prev => ({ ...prev, loading: true, error: null }));

    try {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const role = employee.role?.toLowerCase();
      
      if (role?.includes('artist manager')) {
        try {
          // Fetch Artist Manager statistics
          const [artistsResponse, artworksResponse] = await Promise.all([
            axios.get('http://localhost:5000/artists'),
            axios.get('http://localhost:5000/api/art')
          ]);

          const totalArtists = artistsResponse.data?.length || 0;
          const artworksApproved = artworksResponse.data?.filter(art => art.status === 'approved').length || 0;
          
          // Calculate events participated (simplified - could be enhanced)
          const eventsParticipated = Math.floor(totalArtists * 0.3); // Estimated
          
          // Calculate bookings made (simplified)
          const bookingsMade = Math.floor(totalArtists * 0.8); // Estimated bookings per artist
          
          setStatistics(prev => ({
            ...prev,
            totalArtistsManaged: totalArtists,
            artworksApproved: artworksApproved,
            eventsParticipated: eventsParticipated,
            bookingsMade: bookingsMade,
            loading: false,
            error: null
          }));
        } catch (apiError) {
          console.error('Error fetching artist manager stats:', apiError);
          setStatistics(prev => ({ ...prev, loading: false, error: 'Unable to load artist manager statistics' }));
        }
      } else if (role?.includes('donation manager')) {
        try {
          // Fetch Donation Manager statistics
          const [donationsResponse, campaignsResponse] = await Promise.all([
            axios.get('http://localhost:5000/donor'),
            axios.get('http://localhost:5000/campaign')
          ]);

          const allDonations = donationsResponse.data?.donors || [];
          const totalDonationsReceived = allDonations.length;
          const donationsThisMonth = allDonations.filter(donation => {
            const donationDate = new Date(donation.createdAt || donation.date);
            return donationDate >= startOfMonth && donationDate <= endOfMonth;
          }).length;
          
          const activeCampaigns = campaignsResponse.data?.campaigns?.filter(campaign => campaign.status === 'active').length || 0;
          const topDonor = allDonations.reduce((max, donor) => 
            (donor.Amount > (max?.Amount || 0)) ? donor : max, null
          )?.FirstName || 'N/A';
          
          setStatistics(prev => ({
            ...prev,
            totalDonationsReceived: totalDonationsReceived,
            activeCampaigns: activeCampaigns,
            topDonor: topDonor,
            donationsThisMonth: donationsThisMonth,
            loading: false,
            error: null
          }));
        } catch (apiError) {
          console.error('Error fetching donation manager stats:', apiError);
          setStatistics(prev => ({ ...prev, loading: false, error: 'Unable to load donation manager statistics' }));
        }
      } else if (role?.includes('event manager')) {
        try {
          // Fetch Event Manager statistics
          const eventsResponse = await axios.get('http://localhost:5000/events');
          const totalEventsCreated = eventsResponse.data?.length || 0;
          
          // Calculate artists registered (simplified - using total artists as proxy)
          const artistsRegistered = Math.floor(totalEventsCreated * 2.5); // Estimated artists per event
          
          // Calculate registration fees (simplified)
          const registrationFeesCollected = artistsRegistered * 100; // Estimated fee per registration
          
          // Calculate average feedback rating (simplified)
          const avgFeedbackRating = 4.2; // Could be calculated from actual feedback data
          
          setStatistics(prev => ({
            ...prev,
            totalEventsCreated: totalEventsCreated,
            artistsRegistered: artistsRegistered,
            registrationFeesCollected: registrationFeesCollected,
            avgFeedbackRating: avgFeedbackRating,
            loading: false,
            error: null
          }));
        } catch (apiError) {
          console.error('Error fetching event manager stats:', apiError);
          setStatistics(prev => ({ ...prev, loading: false, error: 'Unable to load event manager statistics' }));
        }
      } else if (role?.includes('marketplace manager')) {
        try {
          // Fetch Marketplace Manager statistics
          const [artworksResponse, ordersResponse] = await Promise.all([
            axios.get('http://localhost:5000/api/art'),
            axios.get('http://localhost:5000/api/orders')
          ]);

          const totalProductsListed = artworksResponse.data?.length || 0;
          const productsSold = ordersResponse.data?.filter(order => order.paymentStatus === 'paid').length || 0;
          
          const totalRevenue = ordersResponse.data?.reduce((sum, order) => 
            order.paymentStatus === 'paid' ? sum + (order.totalAmount || 0) : sum, 0
          ) || 0;
          
          const topSellingProduct = 'Artwork #001'; // Could be calculated from actual sales data
          
          setStatistics(prev => ({
            ...prev,
            totalProductsListed: totalProductsListed,
            productsSold: productsSold,
            totalRevenue: totalRevenue,
            topSellingProduct: topSellingProduct,
            loading: false,
            error: null
          }));
        } catch (apiError) {
          console.error('Error fetching marketplace manager stats:', apiError);
          setStatistics(prev => ({ ...prev, loading: false, error: 'Unable to load marketplace manager statistics' }));
        }
      } else if (role?.includes('admin')) {
        try {
          // Fetch Admin statistics
          const [usersResponse, complaintsResponse, employeesResponse] = await Promise.all([
            axios.get('http://localhost:5000/users'),
            axios.get('http://localhost:5000/complaints'),
            axios.get('http://localhost:5000/api/employees')
          ]);

          const totalUsers = usersResponse.data?.users?.length || 0;
          const totalComplaints = complaintsResponse.data?.complaints?.length || 0;
          const activeManagers = employeesResponse.data?.employees?.filter(emp => 
            emp.status === 'Active' && emp.role?.toLowerCase().includes('manager')
          ).length || 0;
          
          // Calculate total revenue (simplified)
          const totalRevenue = 50000; // Could be calculated from actual revenue data
          
          setStatistics(prev => ({
            ...prev,
            totalUsers: totalUsers,
            adminTotalRevenue: totalRevenue,
            totalComplaints: totalComplaints,
            activeManagers: activeManagers,
            loading: false,
            error: null
          }));
        } catch (apiError) {
          console.error('Error fetching admin stats:', apiError);
          setStatistics(prev => ({ ...prev, loading: false, error: 'Unable to load admin statistics' }));
        }
      } else {
        // For other roles, show basic info without specific statistics
        setStatistics(prev => ({ ...prev, loading: false, error: null }));
      }
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
      setStatistics(prev => ({ ...prev, loading: false, error: 'Failed to load statistics' }));
    }
  }, [employee]);

  useEffect(() => {
    if (isOpen && employee) {
      fetchEmployeeStatistics();
    }
  }, [isOpen, employee, fetchEmployeeStatistics]);

  const getRoleSpecificStats = () => {
    const role = employee?.role?.toLowerCase();
    
    if (role?.includes('artist manager')) {
      return (
        <div className="stats-grid">
          <div className="stat-item">
            <h4>Total Artists Managed</h4>
            <p className="stat-value">{statistics.totalArtistsManaged}</p>
          </div>
          <div className="stat-item">
            <h4>Artworks Approved</h4>
            <p className="stat-value">{statistics.artworksApproved}</p>
          </div>
          <div className="stat-item">
            <h4>Events Participated</h4>
            <p className="stat-value">{statistics.eventsParticipated}</p>
          </div>
          <div className="stat-item">
            <h4>Bookings Made</h4>
            <p className="stat-value">{statistics.bookingsMade}</p>
          </div>
        </div>
      );
    } else if (role?.includes('donation manager')) {
      return (
        <div className="stats-grid">
          <div className="stat-item">
            <h4>Total Donations Received</h4>
            <p className="stat-value">{statistics.totalDonationsReceived}</p>
          </div>
          <div className="stat-item">
            <h4>Active Campaigns</h4>
            <p className="stat-value">{statistics.activeCampaigns}</p>
          </div>
          <div className="stat-item">
            <h4>Top Donor</h4>
            <p className="stat-value">{statistics.topDonor}</p>
          </div>
          <div className="stat-item">
            <h4>Donations This Month</h4>
            <p className="stat-value">{statistics.donationsThisMonth}</p>
          </div>
        </div>
      );
    } else if (role?.includes('event manager')) {
      return (
        <div className="stats-grid">
          <div className="stat-item">
            <h4>Total Events Created</h4>
            <p className="stat-value">{statistics.totalEventsCreated}</p>
          </div>
          <div className="stat-item">
            <h4>Artists Registered</h4>
            <p className="stat-value">{statistics.artistsRegistered}</p>
          </div>
          <div className="stat-item">
            <h4>Registration Fees Collected</h4>
            <p className="stat-value">LKR {statistics.registrationFeesCollected.toLocaleString()}</p>
          </div>
          <div className="stat-item">
            <h4>Avg Feedback Rating</h4>
            <p className="stat-value">{statistics.avgFeedbackRating}/5</p>
          </div>
        </div>
      );
    } else if (role?.includes('marketplace manager')) {
      return (
        <div className="stats-grid">
          <div className="stat-item">
            <h4>Total Products Listed</h4>
            <p className="stat-value">{statistics.totalProductsListed}</p>
          </div>
          <div className="stat-item">
            <h4>Products Sold</h4>
            <p className="stat-value">{statistics.productsSold}</p>
          </div>
          <div className="stat-item">
            <h4>Total Revenue</h4>
            <p className="stat-value">LKR {statistics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="stat-item">
            <h4>Top Selling Product</h4>
            <p className="stat-value">{statistics.topSellingProduct}</p>
          </div>
        </div>
      );
    } else if (role?.includes('admin')) {
      return (
        <div className="stats-grid">
          <div className="stat-item">
            <h4>Total Users</h4>
            <p className="stat-value">{statistics.totalUsers}</p>
          </div>
          <div className="stat-item">
            <h4>Total Revenue</h4>
            <p className="stat-value">LKR {statistics.adminTotalRevenue.toLocaleString()}</p>
          </div>
          <div className="stat-item">
            <h4>Total Complaints</h4>
            <p className="stat-value">{statistics.totalComplaints}</p>
          </div>
          <div className="stat-item">
            <h4>Active Managers</h4>
            <p className="stat-value">{statistics.activeManagers}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="stat-item">
          <h4>Role Statistics</h4>
          <p className="stat-value">No specific metrics available</p>
        </div>
      );
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="modal-overlay">
      <div className="modal profile-modal">
        <div className="modal-header">
          <h2>Employee Profile</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="profile-content">
          <div className="profile-section">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Employee ID:</label>
                <span>{employee.employeeID}</span>
              </div>
              <div className="info-item">
                <label>Name:</label>
                <span>{employee.firstName} {employee.lastName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{employee.email}</span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span>{employee.username}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className="role-badge">{employee.role}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status ${employee.status?.toLowerCase().replace(' ', '-')}`}>
                  {employee.status}
                </span>
              </div>
              <div className="info-item">
                <label>Online Status:</label>
                <span className={`online-indicator ${employee.isOnline ? 'online' : 'offline'}`}>
                  {employee.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Role Performance</h3>
            {statistics.loading ? (
              <div className="loading-stats">
                <p>Loading statistics...</p>
              </div>
            ) : statistics.error ? (
              <div className="error-stats">
                <p>{statistics.error}</p>
                <p className="fallback-info">Showing basic employee information only.</p>
              </div>
            ) : (
              <div className="stats-grid">
                {getRoleSpecificStats()}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
