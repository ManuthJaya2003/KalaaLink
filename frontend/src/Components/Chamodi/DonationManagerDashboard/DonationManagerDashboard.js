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
      // Fetch packages and donations in parallel
      const [packagesRes, donationsRes] = await Promise.all([
        axios.get('http://localhost:5000/package'),
        axios.get('http://localhost:5000/donor')
      ]);
      
      setPackages(packagesRes.data.packages || []);
      setDonations(donationsRes.data.donors || []);
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

  // ✅ Handle package edit navigation
  const handleEditPackage = (packageId) => {
    navigate(`/updatepackage/${packageId}`);
  };

  // ✅ Handle donation filtering
  const handleDonationFilter = (status) => {
    setDonationFilter(status);
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

  const getButtonStyle = (isActive) => ({
    background: isActive ? "#34495e" : "transparent",
    border: "none",
    color: "white",
    textAlign: "left",
    padding: "10px 0",
    margin: "5px 0",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "all 0.3s ease",
    width: "100%"
  });

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

  // Home Tab Component
  const HomeTab = () => (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "#2c3e50", margin: "0" }}>Donation Manager Dashboard</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
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
            <button
              onClick={generatePDFReport}
              style={{
                background: "#27ae60",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                transition: "background-color 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => e.target.style.background = "#229954"}
              onMouseLeave={(e) => e.target.style.background = "#27ae60"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Generate Report
            </button>
          </div>
        </div>
      
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#27ae60", margin: "0 0 10px 0" }}>Total Donations</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "0", color: "#2c3e50" }}>
            LKR {getTotalDonations().toLocaleString()}
          </p>
        </div>
        
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#3498db", margin: "0 0 10px 0" }}>Active Packages</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "0", color: "#2c3e50" }}>
            {getActivePackages()}
          </p>
        </div>
        
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#e74c3c", margin: "0 0 10px 0" }}>Total Donors</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "0", color: "#2c3e50" }}>
            {getTotalDonors()}
          </p>
        </div>
      </div>

      {/* Recent Donations */}
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h3 style={{ color: "#2c3e50", marginBottom: "20px" }}>Recent Donations</h3>
        {donations.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Donor Name</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Amount</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations
                  .filter(donation => donation.paymentStatus === 'paid')
                  .slice(0, 5)
                  .map((donation, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "12px" }}>{donation.FirstName} {donation.LastName}</td>
                    <td style={{ padding: "12px" }}>{donation.Email}</td>
                    <td style={{ padding: "12px", fontWeight: "bold", color: "#27ae60" }}>
                      LKR {donation.Amount?.toLocaleString()}
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
          <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>No donations yet</p>
        )}
      </div>

      {/* Package Donation Statistics Pie Chart */}
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginTop: "20px" }}>
        <h3 style={{ color: "#2c3e50", marginBottom: "20px" }}>Donations by Package</h3>
        {getPackageDonationStats().length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPackageDonationStats()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={80}
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
            </div>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <h4 style={{ color: "#2c3e50", marginBottom: "15px" }}>Package Details</h4>
              {getPackageDonationStats().map((stat, index) => (
                <div key={stat.name} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "8px 0",
                  borderBottom: index < getPackageDonationStats().length - 1 ? "1px solid #eee" : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ 
                      width: "12px", 
                      height: "12px", 
                      backgroundColor: COLORS[index % COLORS.length],
                      borderRadius: "2px"
                    }}></div>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>{stat.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#27ae60" }}>
                      LKR {stat.value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {stat.count} donation{stat.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            color: "#666" 
          }}>
            <h4 style={{ marginBottom: "10px" }}>No donation data available</h4>
            <p style={{ margin: "0" }}>Package donation statistics will appear here once donations are received.</p>
          </div>
        )}
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
          onClick={() => navigate('/addpackages')}
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
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={() => handleEditPackage(pkg._id)}
                  style={{
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "background-color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#2980b9"}
                  onMouseLeave={(e) => e.target.style.background = "#3498db"}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg._id, pkg.name)}
                  disabled={deletingPackage === pkg._id}
                  style={{
                    background: deletingPackage === pkg._id ? "#95a5a6" : "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: deletingPackage === pkg._id ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "background-color 0.3s",
                    opacity: deletingPackage === pkg._id ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (deletingPackage !== pkg._id) {
                      e.target.style.background = "#c0392b";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (deletingPackage !== pkg._id) {
                      e.target.style.background = "#e74c3c";
                    }
                  }}
                >
                  {deletingPackage === pkg._id ? "Deleting..." : "Delete"}
                </button>
                <span style={{ 
                  padding: "8px 12px", 
                  borderRadius: "5px", 
                  fontSize: "12px",
                  background: pkg.isActive ? "#d4edda" : "#f8d7da",
                  color: pkg.isActive ? "#155724" : "#721c24",
                  fontWeight: "bold"
                }}>
                  {pkg.isActive ? "Active" : "Inactive"}
                </span>
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: "#34495e",
        color: "white",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #2c3e50",
      }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Donation Manager Dashboard
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => e.target.style.background = "#c0392b"}
          onMouseLeave={(e) => e.target.style.background = "#e74c3c"}
        >
          Sign Out
        </button>
      </div>

      {/* Main Dashboard Container */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: "220px",
          background: "#2c3e50",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
        }}>
          <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>
          <button onClick={() => setActiveTab("home")} style={getButtonStyle(activeTab === "home")}>
            Home
          </button>
          <button onClick={() => setActiveTab("packages")} style={getButtonStyle(activeTab === "packages")}>
            Manage Packages
          </button>
          <button onClick={() => setActiveTab("donations")} style={getButtonStyle(activeTab === "donations")}>
            View Donations
          </button>
          <button onClick={() => setActiveTab("impactStories")} style={getButtonStyle(activeTab === "impactStories")}>
            Impact Stories
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, background: "#f8f9fa" }}>
          {activeTab === "home" && <HomeTab />}
          {activeTab === "packages" && <PackagesTab />}
          {activeTab === "donations" && <DonationsTab />}
          {activeTab === "impactStories" && <ImpactStoriesManagement />}
        </div>
      </div>
    </div>
  );
}

export default DonationManagerDashboard;
