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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/eventBookings/analytics");
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
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
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Analytics Report - KalaaLink</title>
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
            border-bottom: 3px solid #667eea;
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
          
          .report-meta {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 40px;
          }
          
          .summary-section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #2c3e50;
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .summary-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border-left: 4px solid #667eea;
          }
          
          .summary-item.negative {
            border-left-color: #e74c3c;
          }
          
          .summary-value {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
          }
          
          .summary-label {
            font-size: 14px;
            color: #6c757d;
            font-weight: 600;
          }
          
          .summary-description {
            font-size: 12px;
            color: #6c757d;
            margin-top: 8px;
          }
          
          .chart-section {
            margin-bottom: 40px;
          }
          
          .chart-placeholder {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            color: #6c757d;
            margin: 20px 0;
          }
          
          .table-section {
            margin-bottom: 40px;
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
            background: #667eea;
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
          
          .revenue-cell {
            font-weight: 600;
            color: #28a745;
          }
          
          .refund-cell {
            font-weight: 600;
            color: #e74c3c;
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @media print {
            body { margin: 20px; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="report-title">Event Analytics Report</h1>
          <p class="report-subtitle">KalaaLink - Event Management System</p>
          <div class="report-meta">
            <span>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</span>
            <span>Report Type: Comprehensive Analytics</span>
          </div>
        </div>
        
        <div class="summary-section">
          <h2 class="section-title">Executive Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${analyticsData.summary.totalRevenue}</div>
              <div class="summary-label">Total Revenue</div>
              <div class="summary-description">From all event ticket sales</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${analyticsData.summary.ticketsSold}</div>
              <div class="summary-label">Tickets Sold</div>
              <div class="summary-description">Across all events</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${analyticsData.summary.activeEvents}</div>
              <div class="summary-label">Active Events</div>
              <div class="summary-description">Currently listed</div>
            </div>
            <div class="summary-item negative">
              <div class="summary-value">${analyticsData.summary.totalRefunds}</div>
              <div class="summary-label">Total Refunds</div>
              <div class="summary-description">Processed across all events</div>
            </div>
            <div class="summary-item negative">
              <div class="summary-value">${analyticsData.summary.refundedTickets}</div>
              <div class="summary-label">Refunded Tickets</div>
              <div class="summary-description">Due to cancellations</div>
            </div>
          </div>
        </div>
        
        <div class="chart-section">
          <h2 class="section-title">Ticket Sales Performance</h2>
          <p>Visual representation of tickets sold per event. This chart shows the distribution of ticket sales across different events, helping identify the most popular events and areas for improvement.</p>
          
          <div class="chart-placeholder">
            <h3>📊 Ticket Sales Chart</h3>
            <p>Chart data for ${analyticsData.chartData.length} events</p>
            <p>Total tickets sold: ${analyticsData.chartData.reduce((sum, item) => sum + item.tickets, 0)}</p>
          </div>
          
          <h3>Event Performance Details:</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Tickets Sold</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              ${analyticsData.chartData.map(event => `
                <tr>
                  <td>${event.name}</td>
                  <td>${event.tickets}</td>
                  <td>${event.tickets > 100 ? '🟢 Excellent' : event.tickets > 50 ? '🟡 Good' : '🔴 Needs Attention'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="table-section">
          <h2 class="section-title">Top Performing Events</h2>
          <p>Events generating the highest revenue, ranked by financial performance. This analysis helps identify successful event strategies and investment opportunities.</p>
          
          <table class="report-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Revenue</th>
                <th>Tickets Sold</th>
                <th>Performance Rating</th>
              </tr>
            </thead>
            <tbody>
              ${analyticsData.topPerformingEvents.map((event, index) => `
                <tr>
                  <td>${event.event}</td>
                  <td class="revenue-cell">${event.revenue}</td>
                  <td>${event.ticketsSold}</td>
                  <td>${index === 0 ? '🥇 Top Performer' : index === 1 ? '🥈 Runner Up' : index === 2 ? '🥉 Third Place' : '⭐ Good'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${analyticsData.refundsByEvent.length > 0 ? `
        <div class="table-section">
          <h2 class="section-title">Refunds Analysis</h2>
          <p>Summary of refunds processed for cancelled events. This information helps identify patterns in cancellations and improve event planning strategies.</p>
          
          <table class="report-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Refund Amount</th>
                <th>Tickets Refunded</th>
                <th>Impact Level</th>
              </tr>
            </thead>
            <tbody>
              ${analyticsData.refundsByEvent.map(event => {
                const refundAmount = parseFloat(event.refundAmount.replace('$', '').replace(',', ''));
                const impactLevel = refundAmount > 1000 ? '🔴 High Impact' : refundAmount > 500 ? '🟡 Medium Impact' : '🟢 Low Impact';
                return `
                  <tr>
                    <td>${event.event}</td>
                    <td class="refund-cell">${event.refundAmount}</td>
                    <td class="refund-cell">${event.ticketsRefunded}</td>
                    <td>${impactLevel}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div class="footer">
          <p><strong>KalaaLink Event Management System</strong></p>
          <p>This report was automatically generated based on real-time data from your event management system.</p>
          <p>For questions or support, contact: support@kalaalink.com</p>
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <script>
          // Auto-print when opened
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>Error loading analytics: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!analyticsData) {
    return <p>No analytics data available</p>;
  }

  return (
    <div className="analytics-container">
      {/* Main Header with Title and Button */}
      <div className="analytics-main-header">
        <button className="generate-report-btn" onClick={handleGenerateReport}>
          📄 Generate Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <div className="card-value">{analyticsData.summary.totalRevenue}</div>
            <p>From all event ticket sales</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">🎫</div>
          <div className="card-content">
            <h3>Tickets Sold</h3>
            <div className="card-value">{analyticsData.summary.ticketsSold}</div>
            <p>Across all events</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Active Events</h3>
            <div className="card-value">{analyticsData.summary.activeEvents}</div>
            <p>Currently listed</p>
          </div>
        </div>

        <div className="summary-card negative">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Refunds</h3>
            <div className="card-value">{analyticsData.summary.totalRefunds}</div>
            <p>Processed across all events</p>
          </div>
        </div>

        <div className="summary-card negative">
          <div className="card-icon">↩️</div>
          <div className="card-content">
            <h3>Refunded Tickets</h3>
            <div className="card-value">{analyticsData.summary.refundedTickets}</div>
            <p>Tickets refunded due to cancellations</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-main">
        {/* Chart Section */}
        <div className="chart-section">
          <h2>Ticket Sales by Event</h2>
          <p>A visual breakdown of tickets sold per event.</p>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Tickets Sold']}
                  labelStyle={{ color: '#333' }}
                />
                <Bar dataKey="tickets" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Events Table */}
        <div className="table-section">
          <h2>Top Performing Events</h2>
          <p>Events generating the most revenue.</p>
          
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Revenue</th>
                  <th>Tickets Sold</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topPerformingEvents.map((event, index) => (
                  <tr key={index}>
                    <td>{event.event}</td>
                    <td className="revenue-cell">{event.revenue}</td>
                    <td>{event.ticketsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Refunds Section */}
      {analyticsData.refundsByEvent.length > 0 && (
        <div className="refunds-section">
          <h2>Refunds by Event</h2>
          <p>A summary of refunds processed for cancelled events.</p>
          
          <div className="table-container">
            <table className="analytics-table refunds-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Refund Amount</th>
                  <th>Tickets Refunded</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.refundsByEvent.map((event, index) => (
                  <tr key={index}>
                    <td>{event.event}</td>
                    <td className="refund-amount">{event.refundAmount}</td>
                    <td className="refunded-tickets">{event.ticketsRefunded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsTab;
