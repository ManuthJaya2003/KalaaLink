import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./AnalyticsTab.css";

function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api/orders';

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching real-time analytics data...');
      
      const response = await axios.get(`${API_BASE_URL}/analytics/marketplace`);
      setAnalyticsData(response.data);
      setLastUpdated(new Date());
      setError(null);
      
      console.log('✅ Analytics data updated successfully');
    } catch (err) {
      console.error("❌ Error fetching analytics:", err);
      setError(err.response?.data?.message || err.message);
      
      // Fallback to mock data if API fails
      const mockData = {
        summary: {
          totalRevenue: "LKR 0",
          totalOrders: 0,
          activeProducts: 0,
          totalDeliveries: 0,
          pendingOrders: 0
        },
        chartData: [],
        topPerformingProducts: []
      };
      setAnalyticsData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAnalytics();
    
    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchAnalytics, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    if (!analyticsData) {
      alert("No analytics data available to generate report");
      return;
    }
    
    try {
      // Generate comprehensive PDF report
      generateAnalyticsReport();
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  const generateAnalyticsReport = () => {
    // Create a new window for the report
    const reportWindow = window.open('', '_blank', 'width=1000,height=800');
    
    const data = analyticsData || {};
    const summary = data.summary || {};
    const chartData = data.chartData || [];
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Marketplace Analytics Report - KalaaLink</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 40px;
            background: white;
            color: #2c3e50;
            line-height: 1.6;
          }
          
          .report-header {
            text-align: center;
            border-bottom: 3px solid #C1A37F;
            padding-bottom: 20px;
            margin-bottom: 40px;
          }
          
          .report-title {
            font-size: 36px;
            font-weight: 700;
            color: #2c3e50;
            margin: 0 0 10px 0;
          }
          
          .report-subtitle {
            font-size: 18px;
            color: #6c757d;
            margin: 0 0 20px 0;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
            align-items: start;
          }
          
          .summary-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #C1A37F;
            min-height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .summary-value {
            font-size: 24px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
            line-height: 1.2;
          }
          
          .summary-label {
            font-size: 14px;
            color: #6c757d;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          
          .report-table th {
            background: #C1A37F;
            color: white;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
          }
          
          .report-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #e9ecef;
            font-size: 14px;
          }
          
          .report-table tbody tr:nth-child(even) {
            background: #f8f9fa;
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="report-title">Marketplace Analytics Report</h1>
          <p class="report-subtitle">KalaaLink - Marketplace Management System</p>
        </div>
        
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">${summary.totalRevenue || 'LKR 0'}</div>
            <div class="summary-label">Total Revenue</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${summary.totalOrders || '0'}</div>
            <div class="summary-label">Total Orders</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${summary.activeProducts || '0'}</div>
            <div class="summary-label">Active Products</div>
          </div>
        </div>
        
        <h2>Top Performing Products</h2>
        <table class="report-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Revenue</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            ${data.topPerformingProducts?.map(product => `
              <tr>
                <td>${product.product}</td>
                <td>${product.revenue}</td>
                <td>${product.orders}</td>
              </tr>
            `).join('') || '<tr><td colspan="3">No data available</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  if (error && !analyticsData) {
    return (
      <div className="analytics-error">
        <p>Error loading analytics: {error}</p>
        <button onClick={fetchAnalytics}>Try Again</button>
      </div>
    );
  }

  if (loading && !analyticsData) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading real-time analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Page Header */}
      <div className="analytics-page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="analytics-page-title">Marketplace Analytics</h1>
            <p className="analytics-page-subtitle">Comprehensive insights and performance metrics for your marketplace</p>
            {lastUpdated && (
              <p className="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {loading && <span className="updating-indicator"> (Updating...)</span>}
              </p>
            )}
          </div>
          <div className="header-actions">
            <button 
              className="refresh-btn" 
              onClick={fetchAnalytics}
              disabled={loading}
            >
              {loading ? '🔄' : '↻'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-content">
            <h3>Total Revenue</h3>
            <div className="card-value">{analyticsData.summary.totalRevenue}</div>
            <p>From all product sales</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Total Orders</h3>
            <div className="card-value">{analyticsData.summary.totalOrders}</div>
            <p>Across all products</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Active Products</h3>
            <div className="card-value">{analyticsData.summary.activeProducts}</div>
            <p>Currently listed</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Total Deliveries</h3>
            <div className="card-value">{analyticsData.summary.totalDeliveries}</div>
            <p>Completed deliveries</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Pending Orders</h3>
            <div className="card-value">{analyticsData.summary.pendingOrders}</div>
            <p>Awaiting processing</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-main">
        {/* Chart Section */}
        <div className="chart-section">
          <h2>Orders by Product Category</h2>
          <p>A visual breakdown of orders per product category.</p>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={analyticsData.chartData} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Orders']}
                  labelStyle={{ color: '#333' }}
                />
                <Bar dataKey="orders" fill="#C1A37F" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Products Table */}
        <div className="table-section">
          <h2>Top Performing Products</h2>
          <p>Products generating the most revenue.</p>
          
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topPerformingProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.product}</td>
                    <td className="revenue-cell">{product.revenue}</td>
                    <td>{product.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Report Button at Bottom */}
      <div className="analytics-bottom-section">
        <button className="generate-report-btn-bottom" onClick={handleGenerateReport}>
          Generate Report
        </button>
      </div>
    </div>
  );
}

export default AnalyticsTab;
