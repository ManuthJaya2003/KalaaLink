import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import OverviewBarChart from './OverviewBarChart';
import OverviewLineChart from './OverviewLineChart';
import RevenuePieChart from './RevenuePieChart';
import './SystemOverview.css';

function SystemOverview() {
  const [systemData, setSystemData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalProductsSold: 0,
    totalArtists: 0,
    pendingBookings: 0,
    paidBookings: 0
  });
  const [chartData, setChartData] = useState({
    lineChart: [],
    pieChart: [],
    barChart: []
  });
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch system overview data
  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/dashboard/system-overview');
      setSystemData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError('Failed to fetch system data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chart data
  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const response = await axios.get('http://localhost:5000/api/dashboard/chart-data');
      setChartData(response.data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    fetchChartData();
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSystemData();
      fetchChartData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate PDF report
  const generateSystemReport = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const timestamp = new Date().toLocaleString();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KalaaLink System Report', 20, 30);
      
      // Add timestamp
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${timestamp}`, 20, 45);
      
      // Add system statistics
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('System Statistics', 20, 65);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      let yPosition = 80;
      const lineHeight = 8;
      
      // Add statistics data
      const stats = [
        `Total Revenue: LKR ${systemData.totalRevenue.toLocaleString()}`,
        `Active Users: ${systemData.totalUsers.toLocaleString()}`,
        `Total Bookings: ${systemData.totalBookings.toLocaleString()}`,
        `Products Sold: ${systemData.totalProductsSold.toLocaleString()}`,
        `Approved Artists: ${systemData.totalArtists}`,
        `Pending Bookings: ${systemData.pendingBookings}`,
        `Paid Bookings: ${systemData.paidBookings}`
      ];

      // Add chart data summary
      if (chartData.pieChart && chartData.pieChart.length > 0) {
        pdf.text('Revenue Distribution:', 20, yPosition + 10);
        yPosition += 20;
        
        chartData.pieChart.forEach(item => {
          pdf.text(`  ${item.name}: LKR ${item.value.toLocaleString()}`, 20, yPosition);
          yPosition += lineHeight;
        });
      }
      
      stats.forEach(stat => {
        pdf.text(stat, 20, yPosition);
        yPosition += lineHeight;
      });
      
      // Add footer
      pdf.setFontSize(10);
      pdf.text('This report was generated automatically by KalaaLink Admin Dashboard', 20, 280);
      
      // Save the PDF
      pdf.save(`System_Report_${timestamp.replace(/[^\w\s]/gi, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    }
  };

  if (loading) {
    return (
      <div className="system-overview">
        <div className="section-header">
          <h1>Analytics</h1>
          <p className="section-subtitle">Monitor system performance and track key metrics across all departments</p>
        </div>
        <div className="loading-container">
          <p>Loading system data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-overview">
        <div className="error-container">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchSystemData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="system-overview" id="system-overview-content">
      <div className="section-header">
        <h1>Analytics</h1>
        <p className="section-subtitle">Monitor system performance and track key metrics across all departments</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card revenue-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">LKR {systemData.totalRevenue.toLocaleString()}</p>
            <span className="stat-label">From paid bookings</span>
          </div>
        </div>

        <div className="stat-card users-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="card-content">
            <h3>Active Users</h3>
            <p className="stat-value">{systemData.totalUsers.toLocaleString()}</p>
            <span className="stat-label">Registered users</span>
          </div>
        </div>

        <div className="stat-card bookings-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="card-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{systemData.totalBookings.toLocaleString()}</p>
            <span className="stat-label">All bookings</span>
          </div>
        </div>

        <div className="stat-card products-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="card-content">
            <h3>Products Sold</h3>
            <p className="stat-value">{systemData.totalProductsSold.toLocaleString()}</p>
            <span className="stat-label">Art pieces</span>
          </div>
        </div>
      </div>

      <div className="additional-stats">
        <div className="stat-row">
          <div className="mini-stat">
            <h4>Approved Artists</h4>
            <p>{systemData.totalArtists}</p>
          </div>
          <div className="mini-stat">
            <h4>Pending Bookings</h4>
            <p>{systemData.pendingBookings}</p>
          </div>
          <div className="mini-stat">
            <h4>Paid Bookings</h4>
            <p>{systemData.paidBookings}</p>
          </div>
        </div>
      </div>

      <div className="last-updated">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h2 className="charts-title">System Analytics</h2>
        
        <div className="charts-grid">
          <OverviewBarChart data={chartData.barChart} />
          <OverviewLineChart data={chartData.lineChart} />
          <RevenuePieChart data={chartData.pieChart} />
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="report-section">
        <button onClick={generateSystemReport} className="generate-report-btn">
          Generate System Report
        </button>
      </div>
    </div>
  );
}

export default SystemOverview;
