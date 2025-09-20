import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '../../MainNav/MainNav';
import logoutEmployee from '../../../utils/employeeLogout';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ImpactStoriesManagement from '../ImpactStoriesManagement/ImpactStoriesManagement';
import './DonationManagerDashboard.css';

function DonationManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [packages, setPackages] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deletingPackage, setDeletingPackage] = useState(null);
  const [donationFilter, setDonationFilter] = useState('all'); // all, pending, paid
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [partnershipRequests, setPartnershipRequests] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    description: '',
    isActive: true
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    amount: '',
    description: '',
    isActive: true
  });

  // Check if user is authenticated as donation manager
  useEffect(() => {
    const employee = JSON.parse(localStorage.getItem('employee') || '{}');
    if (!employee.id || employee.role.toLowerCase() !== 'donation manager') {
      navigate('/professional_login');
      return;
    }
    fetchData();
    
    // ✅ Real-time updates: Refresh data every 10 seconds to show immediate payment status changes
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch packages, donations, and partnership requests in parallel
      const [packagesRes, donationsRes, partnershipRes] = await Promise.all([
        axios.get('http://localhost:5000/package'),
        axios.get('http://localhost:5000/donor'),
        axios.get('http://localhost:5000/api/partnerships')
      ]);
      
      setPackages(packagesRes.data.packages || []);
      setDonations(donationsRes.data.donors || []);
      setPartnershipRequests(partnershipRes.data.partnershipRequests || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logoutEmployee(navigate, "/mainhome");
  };

  // ✅ Handle package deletion with confirmation
  const handleDeletePackage = async (packageId, packageName) => {
    if (!window.confirm(`Are you sure you want to delete the "${packageName}" package? This action cannot be undone.`)) {
      return;
    }

    setDeletingPackage(packageId);
    try {
      await axios.delete(`http://localhost:5000/package/${packageId}`);
      console.log(`✅ Package "${packageName}" deleted successfully`);
      
      // Refresh data to show updated packages list
      await fetchData();
      
      alert(`Package "${packageName}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package. Please try again.');
    } finally {
      setDeletingPackage(null);
    }
  };

  // ✅ Handle package edit - open modal
  const handleEditPackage = (packageId) => {
    const packageToEdit = packages.find(pkg => pkg._id === packageId);
    if (packageToEdit) {
      setEditingPackage(packageToEdit);
      setEditFormData({
        name: packageToEdit.name || '',
        amount: packageToEdit.amount || '',
        description: packageToEdit.description || '',
        isActive: packageToEdit.isActive !== undefined ? packageToEdit.isActive : true
      });
      setShowEditModal(true);
    }
  };

  // ✅ Handle donation filtering
  const handleDonationFilter = (status) => {
    setDonationFilter(status);
  };

  // ✅ Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ Handle save package changes
  const handleSavePackage = async () => {
    if (!editingPackage) return;

    // Validation - same as original Edit page
    if (!editFormData.name || !editFormData.amount) {
      alert('Package name and amount are required');
      return;
    }
    if (Number(editFormData.amount) < 10) {
      alert('Minimum amount is LKR 10');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/package/${editingPackage._id}`, {
        name: String(editFormData.name),
        amount: Number(editFormData.amount),
        description: String(editFormData.description || ''),
        isActive: Boolean(editFormData.isActive)
      });

      // Check if response contains package data (successful update)
      if (response.data && response.data.package) {
        alert('Package updated successfully!');
        setShowEditModal(false);
        setEditingPackage(null);
        fetchData(); // Refresh the packages list
      } else {
        alert('Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to update package. Please try again.');
      }
    }
  };

  // ✅ Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingPackage(null);
    setEditFormData({
      name: '',
      amount: '',
      description: '',
      isActive: true
    });
  };

  // ✅ Handle add form input changes
  const handleAddInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ Handle save new package
  const handleSaveNewPackage = async () => {
    // Validation - same as original Add Package page
    if (!addFormData.name || !addFormData.amount) {
      alert('Package name and amount are required');
      return;
    }
    if (Number(addFormData.amount) < 10) {
      alert('Minimum amount is LKR 10');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/package', {
        name: String(addFormData.name),
        amount: Number(addFormData.amount),
        description: String(addFormData.description || ''),
        isActive: Boolean(addFormData.isActive)
      });

      // Check if response contains package data (successful creation)
      if (response.data && response.data.package) {
        alert('Package added successfully!');
        setShowAddModal(false);
        setAddFormData({
          name: '',
          amount: '',
          description: '',
          isActive: true
        });
        fetchData(); // Refresh the packages list
      } else {
        alert('Failed to add package');
      }
    } catch (error) {
      console.error('Error adding package:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to add package. Please try again.');
      }
    }
  };

  // ✅ Handle cancel add
  const handleCancelAdd = () => {
    setShowAddModal(false);
    setAddFormData({
      name: '',
      amount: '',
      description: '',
      isActive: true
    });
  };


  // ✅ Handle partnership request approval
  const handleApprovePartnership = async (requestId) => {
    try {
      await axios.patch(`http://localhost:5000/api/partnerships/${requestId}/approve`);
      console.log(`✅ Partnership request ${requestId} approved successfully`);
      await fetchData(); // Refresh data
      alert('Partnership request approved successfully!');
    } catch (error) {
      console.error('Error approving partnership request:', error);
      alert('Failed to approve partnership request. Please try again.');
    }
  };

  // ✅ Handle partnership request rejection
  const handleRejectPartnership = async (requestId) => {
    try {
      await axios.patch(`http://localhost:5000/api/partnerships/${requestId}/reject`);
      console.log(`✅ Partnership request ${requestId} rejected successfully`);
      await fetchData(); // Refresh data
      alert('Partnership request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting partnership request:', error);
      alert('Failed to reject partnership request. Please try again.');
    }
  };

  // ✅ Handle individual partnership request deletion
  const handleDeletePartnership = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this partnership request? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/partnerships/${requestId}`);
        console.log(`✅ Partnership request ${requestId} deleted successfully`);
        await fetchData(); // Refresh data
        alert('Partnership request deleted successfully!');
      } catch (error) {
        console.error('Error deleting partnership request:', error);
        alert('Failed to delete partnership request. Please try again.');
      }
    }
  };

  // ✅ Handle clearing all approved partnership requests
  const handleClearApproved = async () => {
    if (window.confirm('Are you sure you want to delete ALL approved partnership requests? This action cannot be undone.')) {
      try {
        await axios.delete('http://localhost:5000/api/partnerships/clear/Approved');
        console.log('✅ All approved partnership requests deleted successfully');
        await fetchData(); // Refresh data
        alert('All approved partnership requests deleted successfully!');
      } catch (error) {
        console.error('Error clearing approved requests:', error);
        alert('Failed to clear approved requests. Please try again.');
      }
    }
  };

  // ✅ Handle clearing all rejected partnership requests
  const handleClearRejected = async () => {
    if (window.confirm('Are you sure you want to delete ALL rejected partnership requests? This action cannot be undone.')) {
      try {
        await axios.delete('http://localhost:5000/api/partnerships/clear/Rejected');
        console.log('✅ All rejected partnership requests deleted successfully');
        await fetchData(); // Refresh data
        alert('All rejected partnership requests deleted successfully!');
      } catch (error) {
        console.error('Error clearing rejected requests:', error);
        alert('Failed to clear rejected requests. Please try again.');
      }
    }
  };

  // ✅ Handle bulk delete donations by status
  const handleBulkDeleteDonations = async (status) => {
    const statusText = status === 'pending' ? 'Pending' : 'Paid';
    const filteredDonations = donations.filter(donation => donation.paymentStatus === status);
    
    if (filteredDonations.length === 0) {
      alert(`No ${statusText} donations found to delete.`);
      return;
    }

    const confirmMessage = `Are you sure you want to delete ALL ${filteredDonations.length} ${statusText} donations? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBulkDeleting(true);
    try {
      console.log(`🔄 Attempting to delete ${status} donations from: http://localhost:5000/donor/bulk-delete/${status}`);
      const response = await axios.delete(`http://localhost:5000/donor/bulk-delete/${status}`);
      console.log(`✅ Bulk deleted ${response.data.deletedCount} ${status} donations`);
      
      // Refresh data to show updated donations list
      await fetchData();
      
      alert(`Successfully deleted ${response.data.deletedCount} ${statusText} donations.`);
    } catch (error) {
      console.error('Error bulk deleting donations:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        alert('Bulk delete endpoint not found. Please check if the backend server is running and restart it if needed.');
      } else {
        alert(`Failed to delete donations: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setBulkDeleting(false);
    }
  };


  const getTotalDonations = () => {
    return donations
      .filter(donation => donation.paymentStatus === 'paid')
      .reduce((total, donation) => total + (donation.Amount || 0), 0);
  };

  const getActivePackages = () => {
    return packages.filter(pkg => pkg.isActive).length;
  };

  const getTotalDonors = () => {
    return donations.filter(donation => donation.paymentStatus === 'paid').length;
  };

  // ✅ Get package donation statistics for pie chart
  const getPackageDonationStats = () => {
    const paidDonations = donations.filter(donation => donation.paymentStatus === 'paid');
    
    // Group donations by package name
    const packageStats = {};
    paidDonations.forEach(donation => {
      const packageName = donation.packageName || 'Custom Donation';
      if (!packageStats[packageName]) {
        packageStats[packageName] = {
          name: packageName,
          value: 0,
          count: 0
        };
      }
      packageStats[packageName].value += donation.Amount || 0;
      packageStats[packageName].count += 1;
    });

    // Convert to array and sort by value
    return Object.values(packageStats).sort((a, b) => b.value - a.value);
  };

  // ✅ Colors for pie chart segments
  const COLORS = ['#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];

  // ✅ Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Donation Management System Report', 20, 30);
    
    // Date and time
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${currentDate} at ${currentTime}`, 20, 45);
    
    let yPosition = 60;
    
    // Summary Statistics
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Donations: LKR ${getTotalDonations().toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Donors: ${getTotalDonors()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Active Packages: ${getActivePackages()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Packages: ${packages.length}`, 20, yPosition);
    yPosition += 20;
    
    // Package Statistics
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Package Donation Statistics', 20, yPosition);
    yPosition += 15;
    
    const packageStats = getPackageDonationStats();
    if (packageStats.length > 0) {
      const tableData = packageStats.map(stat => [
        stat.name,
        `LKR ${stat.value.toLocaleString()}`,
        stat.count.toString(),
        `${((stat.value / getTotalDonations()) * 100).toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Package Name', 'Total Amount', 'Donations', 'Percentage']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94] },
        styles: { fontSize: 10 }
      });
      
      yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : yPosition + 100;
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No package donation data available', 20, yPosition);
      yPosition += 20;
    }
    
    // Recent Donations Table
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Donations (Last 10)', 20, yPosition);
    yPosition += 15;
    
    const recentDonations = donations
      .filter(donation => donation.paymentStatus === 'paid')
      .slice(0, 10);
    
    if (recentDonations.length > 0) {
      const donationTableData = recentDonations.map(donation => [
        `${donation.FirstName} ${donation.LastName}`,
        donation.Email,
        `LKR ${donation.Amount?.toLocaleString()}`,
        donation.packageName || 'Custom',
        new Date(donation.paymentDate || donation.createdAt || Date.now()).toLocaleDateString()
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Donor Name', 'Email', 'Amount', 'Package', 'Date']],
        body: donationTableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94] },
        styles: { fontSize: 9 }
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No donation data available', 20, yPosition);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('KalaaLink Donation Management System', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
    }
    
    // Download the PDF
    const fileName = `Donation_Report_${currentDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  };

  // Analytics Tab Component
  const AnalyticsTab = () => (
    <div className="analytics-container">
      <div className="analytics-page-header">
        <h1 className="analytics-page-title">Donation Analytics</h1>
        <p className="analytics-page-subtitle">
          Track donation performance, package statistics, and donor insights
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-content">
            <h3>Total Donations</h3>
            <div className="card-value">LKR {getTotalDonations().toLocaleString()}</div>
            <p>All time revenue</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-content">
            <h3>Active Packages</h3>
            <div className="card-value">{getActivePackages()}</div>
            <p>Currently available</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-content">
            <h3>Total Donors</h3>
            <div className="card-value">{getTotalDonors()}</div>
            <p>Unique contributors</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-content">
            <h3>Pending Donations</h3>
            <div className="card-value">{donations.filter(d => d.paymentStatus === 'pending').length}</div>
            <p>Awaiting payment</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-content">
            <h3>Completed Donations</h3>
            <div className="card-value">{donations.filter(d => d.paymentStatus === 'paid').length}</div>
            <p>Successfully processed</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-main">
        {/* Recent Donations Table */}
        <div className="table-section">
          <h2>Recent Donations</h2>
          <p>Latest donation transactions and their status</p>
          
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Email</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations
                  .filter(donation => donation.paymentStatus === 'paid')
                  .slice(0, 10)
                  .map((donation, index) => (
                  <tr key={index}>
                    <td>{donation.FirstName} {donation.LastName}</td>
                    <td>{donation.Email}</td>
                    <td>{packages.find(pkg => pkg._id === donation.packageId)?.name || 'Unknown'}</td>
                    <td className="revenue-cell">LKR {donation.Amount?.toLocaleString()}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: donation.paymentStatus === 'paid' ? '#d4edda' : '#f8d7da',
                        color: donation.paymentStatus === 'paid' ? '#155724' : '#721c24'
                      }}>
                        {donation.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(donation.paymentDate || donation.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-section">
          <h2>Donations by Package</h2>
          <p>Visual breakdown of donations received per package</p>
          
          <div className="chart-container">
            {getPackageDonationStats().length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={getPackageDonationStats()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPackageDonationStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`LKR ${value.toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => `Package: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-error">
                <p>No donation data available</p>
                <p>Package donation statistics will appear here once donations are received.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="analytics-bottom-section">
        <button
          onClick={generatePDFReport}
          className="generate-report-btn-bottom"
        >
          📊 Generate Full Report
        </button>
      </div>
    </div>
  );

  // Home Tab Component
  const HomeTab = () => (
    <div className="home-tab">
      <div className="welcome-section">
        <h1>Welcome to the Donation Manager Dashboard</h1>
        <p className="welcome-subtitle">
          Manage donation packages, track donations, and analyze impact all in one place.
        </p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-content">
            <p>Get started with these common tasks:</p>
            <ul className="action-list">
              <li>Create a new donation package</li>
              <li>View all donations</li>
              <li>Manage impact stories</li>
              <li>Review partnership requests</li>
            </ul>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Dashboard Overview</h3>
          </div>
          <div className="card-content">
            <p>Use the sidebar navigation to access different sections:</p>
            <div className="feature-list">
              <div className="feature-item">
                <strong>Analytics:</strong> Track donation metrics and performance
              </div>
              <div className="feature-item">
                <strong>Manage Packages:</strong> Create and edit donation packages
              </div>
              <div className="feature-item">
                <strong>View Donations:</strong> Monitor all donation transactions
              </div>
              <div className="feature-item">
                <strong>Impact Stories:</strong> Manage success stories and testimonials
              </div>
              <div className="feature-item">
                <strong>Partnership Requests:</strong> Review and manage partnership inquiries
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Packages Tab Component
  const PackagesTab = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ color: "#2c3e50", margin: "0 0 5px 0" }}>Manage Packages</h2>
          <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
            {packages.length} package{packages.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: "#27ae60",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s"
          }}
          onMouseEnter={(e) => e.target.style.background = "#229954"}
          onMouseLeave={(e) => e.target.style.background = "#27ae60"}
        >
          Add New Package
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "20px" }}>Loading packages...</p>
      ) : packages.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          background: "white", 
          borderRadius: "10px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)" 
        }}>
          <h3 style={{ color: "#666", marginBottom: "10px" }}>No packages found</h3>
          <p style={{ color: "#999", marginBottom: "20px" }}>Create your first donation package to get started.</p>
          <button
            onClick={() => navigate('/addpackages')}
            style={{
              background: "#27ae60",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Add First Package
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {packages.map((pkg) => (
            <div key={pkg._id} style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
              <h3 style={{ color: "#2c3e50", margin: "0 0 10px 0" }}>{pkg.name}</h3>
              <p style={{ fontSize: "20px", fontWeight: "bold", color: "#27ae60", margin: "0 0 10px 0" }}>
                LKR {pkg.amount?.toLocaleString()}
              </p>
              <p style={{ color: "#666", margin: "0 0 15px 0" }}>{pkg.description || "No description"}</p>
              <div className="package-actions">
                <button
                  onClick={() => handleEditPackage(pkg._id)}
                  className="edit-button-beige"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg._id, pkg.name)}
                  disabled={deletingPackage === pkg._id}
                  className="delete-button-red"
                >
                  {deletingPackage === pkg._id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <div className={`package-status ${pkg.isActive ? 'active' : 'inactive'}`}>
                {pkg.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Donations Tab Component
  const DonationsTab = () => {
    // ✅ Filter donations based on selected status
    const filteredDonations = donations.filter(donation => {
      if (donationFilter === 'all') return true;
      return donation.paymentStatus === donationFilter;
    });

    // ✅ Get counts for each status
    const pendingCount = donations.filter(d => d.paymentStatus === 'pending').length;
    const paidCount = donations.filter(d => d.paymentStatus === 'paid').length;

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ color: "#2c3e50", margin: "0 0 5px 0" }}>
              {donationFilter === 'all' ? 'All Donations' : 
               `${donationFilter === 'pending' ? 'Pending' : 'Paid'} Donations`}
            </h2>
            <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
              Showing {filteredDonations.length} of {donations.length} donations
            </p>
          </div>
          {lastUpdated && (
            <div style={{ 
              fontSize: "12px", 
              color: "#666", 
              background: "#f8f9fa", 
              padding: "5px 10px", 
              borderRadius: "4px",
              border: "1px solid #dee2e6"
            }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* ✅ Filter Controls */}
        <div style={{ 
          display: "flex", 
          gap: "15px", 
          alignItems: "center", 
          marginBottom: "20px",
          padding: "15px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Filter by Status:</label>
            <select
              value={donationFilter}
              onChange={(e) => handleDonationFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "14px",
                background: "white"
              }}
            >
              <option value="all">All Donations ({donations.length})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="paid">Paid ({paidCount})</option>
            </select>
          </div>


          {/* ✅ Clear Button - only show when filtered */}
          {donationFilter !== 'all' && (
            <button
              onClick={() => handleBulkDeleteDonations(donationFilter)}
              disabled={bulkDeleting || filteredDonations.length === 0}
              style={{
                background: bulkDeleting ? "#95a5a6" : "#e74c3c",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: bulkDeleting || filteredDonations.length === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                transition: "background-color 0.3s",
                opacity: bulkDeleting || filteredDonations.length === 0 ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!bulkDeleting && filteredDonations.length > 0) {
                  e.target.style.background = "#c0392b";
                }
              }}
              onMouseLeave={(e) => {
                if (!bulkDeleting && filteredDonations.length > 0) {
                  e.target.style.background = "#e74c3c";
                }
              }}
            >
              {bulkDeleting ? "Deleting..." : `Clear All ${donationFilter === 'pending' ? 'Pending' : 'Paid'} (${filteredDonations.length})`}
            </button>
          )}
        </div>
      
      {loading ? (
        <p style={{ textAlign: "center", padding: "20px" }}>Loading donations...</p>
      ) : (
        <div style={{ background: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          {filteredDonations.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Donor Name</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Email</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Phone</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Amount</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Note</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "12px" }}>{donation.FirstName} {donation.LastName}</td>
                      <td style={{ padding: "12px" }}>{donation.Email}</td>
                      <td style={{ padding: "12px" }}>{donation.PhoneNumber}</td>
                      <td style={{ padding: "12px", fontWeight: "bold", color: "#27ae60" }}>
                        LKR {donation.Amount?.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: donation.paymentStatus === 'paid' ? "#d4edda" : 
                                     donation.paymentStatus === 'pending' ? "#fff3cd" : "#f8d7da",
                          color: donation.paymentStatus === 'paid' ? "#155724" : 
                                 donation.paymentStatus === 'pending' ? "#856404" : "#721c24"
                        }}>
                          {donation.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {donation.DonorNote || "No note"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {new Date(donation.paymentDate || donation.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: "40px",
              color: "#666"
            }}>
              <h3 style={{ marginBottom: "10px" }}>
                {donationFilter === 'all' ? 'No donations found' : 
                 `No ${donationFilter} donations found`}
              </h3>
              <p style={{ margin: "0" }}>
                {donationFilter === 'all' ? 
                  'Donations will appear here once donors start making contributions.' :
                  `Try selecting a different filter or check back later for ${donationFilter} donations.`
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
    );
  };

  // Partnerships Tab Component
  const PartnershipsTab = () => {
    const pendingRequests = partnershipRequests.filter(req => req.status === 'Pending');
    const approvedRequests = partnershipRequests.filter(req => req.status === 'Approved');
    const rejectedRequests = partnershipRequests.filter(req => req.status === 'Rejected');

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ color: "#2c3e50", margin: "0 0 5px 0" }}>Partnership Requests</h2>
            <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
              Manage partnership requests from organizations
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", fontSize: "12px" }}>
            <span style={{ 
              background: "#fff3cd", 
              color: "#856404", 
              padding: "4px 8px", 
              borderRadius: "4px",
              fontWeight: "bold"
            }}>
              Pending: {pendingRequests.length}
            </span>
            <span style={{ 
              background: "#d4edda", 
              color: "#155724", 
              padding: "4px 8px", 
              borderRadius: "4px",
              fontWeight: "bold"
            }}>
              Approved: {approvedRequests.length}
            </span>
            <span style={{ 
              background: "#f8d7da", 
              color: "#721c24", 
              padding: "4px 8px", 
              borderRadius: "4px",
              fontWeight: "bold"
            }}>
              Rejected: {rejectedRequests.length}
            </span>
          </div>
        </div>

        {/* Clear Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {approvedRequests.length > 0 && (
            <button
              onClick={handleClearApproved}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              Clear All Approved ({approvedRequests.length})
            </button>
          )}
          {rejectedRequests.length > 0 && (
            <button
              onClick={handleClearRejected}
              style={{
                background: "#6c757d",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              Clear All Rejected ({rejectedRequests.length})
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Loading partnership requests...</p>
        ) : partnershipRequests.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            background: "white", 
            borderRadius: "10px", 
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)" 
          }}>
            <h3 style={{ color: "#666", marginBottom: "10px" }}>No partnership requests found</h3>
            <p style={{ color: "#999", margin: "0" }}>Partnership requests will appear here when organizations submit them.</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Organization</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Contact</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Email</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Message</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Logo</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Date</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partnershipRequests.map((request, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>{request.organizationName}</td>
                      <td style={{ padding: "12px" }}>{request.contactName}</td>
                      <td style={{ padding: "12px" }}>{request.contactEmail}</td>
                      <td style={{ padding: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {request.message.length > 50 ? `${request.message.substring(0, 50)}...` : request.message}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {request.logo ? (
                          <img 
                            src={request.logo} 
                            alt="Logo" 
                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div style={{ 
                            width: "40px", 
                            height: "40px", 
                            background: "#f8f9fa", 
                            borderRadius: "4px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            color: "#666",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {request.organizationName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: request.status === 'Approved' ? "#d4edda" : 
                                     request.status === 'Pending' ? "#fff3cd" : "#f8d7da",
                          color: request.status === 'Approved' ? "#155724" : 
                                 request.status === 'Pending' ? "#856404" : "#721c24"
                        }}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          {request.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprovePartnership(request._id)}
                                style={{
                                  background: "#27ae60",
                                  color: "white",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold"
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectPartnership(request._id)}
                                style={{
                                  background: "#e74c3c",
                                  color: "white",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold"
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeletePartnership(request._id)}
                            style={{
                              background: "#6c757d",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}
                          >
                            Delete
                          </button>
                          {request.status !== 'Pending' && (
                            <span style={{ color: "#666", fontSize: "12px", alignSelf: "center" }}>
                              {request.status === 'Approved' ? 'Approved' : 'Rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "#e74c3c" }}>{error}</p>
        <button onClick={fetchData} style={{ marginTop: "10px", padding: "10px 20px" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Fixed Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Donation Manager Dashboard</h2>
          <div className="sidebar-logo">
            <img src="/logo.png" alt="KalaaLink Logo" className="logo-icon" />
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveTab("home")} 
            className={`sidebar-btn ${activeTab === "home" ? "active" : ""}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab("analytics")} 
            className={`sidebar-btn ${activeTab === "analytics" ? "active" : ""}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab("packages")} 
            className={`sidebar-btn ${activeTab === "packages" ? "active" : ""}`}
          >
            Manage Packages
          </button>
          <button 
            onClick={() => setActiveTab("donations")} 
            className={`sidebar-btn ${activeTab === "donations" ? "active" : ""}`}
          >
            View Donations
          </button>
          <button 
            onClick={() => setActiveTab("impactStories")} 
            className={`sidebar-btn ${activeTab === "impactStories" ? "active" : ""}`}
          >
            Impact Stories
          </button>
          <button 
            onClick={() => setActiveTab("partnerships")} 
            className={`sidebar-btn ${activeTab === "partnerships" ? "active" : ""}`}
          >
            Partnership Requests
          </button>
          <button 
            onClick={handleSignOut} 
            className="sidebar-btn signout-btn"
          >
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === "home" && <HomeTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "packages" && <PackagesTab />}
          {activeTab === "donations" && <DonationsTab />}
          {activeTab === "impactStories" && <ImpactStoriesManagement />}
          {activeTab === "partnerships" && <PartnershipsTab />}
        </div>
      </div>

      {/* Edit Package Modal */}
      {showEditModal && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>Edit Package</h3>
              <button onClick={handleCancelEdit} className="close-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="story-form">
              {/* Hidden input for package ID */}
              <input
                type="hidden"
                name="packageId"
                value={editingPackage?._id || ''}
              />
              
              <div className="form-group">
                <label htmlFor="edit-name">Package Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  placeholder="Enter package name"
                  required
                  minLength="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-amount">Amount (LKR) *</label>
                <input
                  type="number"
                  id="edit-amount"
                  name="amount"
                  value={editFormData.amount}
                  onChange={handleEditInputChange}
                  placeholder="Enter package amount"
                  min="10"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description *</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  placeholder="Enter package description"
                  rows="4"
                  required
                  minLength="1"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editFormData.isActive}
                    onChange={handleEditInputChange}
                  />
                  <span className="checkmark"></span>
                  Active (package is available for donations)
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePackage}
                  className="submit-button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>Add New Package</h3>
              <button onClick={handleCancelAdd} className="close-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="story-form">
              <div className="form-group">
                <label htmlFor="add-name">Package Name *</label>
                <input
                  type="text"
                  id="add-name"
                  name="name"
                  value={addFormData.name}
                  onChange={handleAddInputChange}
                  placeholder="Enter package name"
                  required
                  minLength="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-amount">Amount (LKR) *</label>
                <input
                  type="number"
                  id="add-amount"
                  name="amount"
                  value={addFormData.amount}
                  onChange={handleAddInputChange}
                  placeholder="Enter package amount"
                  min="10"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-description">Description *</label>
                <textarea
                  id="add-description"
                  name="description"
                  value={addFormData.description}
                  onChange={handleAddInputChange}
                  placeholder="Enter package description"
                  rows="4"
                  required
                  minLength="1"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={addFormData.isActive}
                    onChange={handleAddInputChange}
                  />
                  <span className="checkmark"></span>
                  Active (package is available for donations)
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewPackage}
                  className="submit-button"
                >
                  Add Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationManagerDashboard;
