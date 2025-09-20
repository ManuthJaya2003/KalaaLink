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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("http://localhost:5000/eventBookings/analytics");
        setAnalyticsData(response.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.response?.data?.message || err.message);
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
    
    // Ensure we have data with fallbacks
    const data = analyticsData || {};
    const summary = data.summary || {};
    const chartData = data.chartData || [];
    
    // Debug: Log the data structure
    console.log('Analytics Data:', data);
    console.log('Summary:', summary);
    console.log('Total Revenue:', summary.totalRevenue);
    console.log('Total Refunds:', summary.totalRefunds);
    console.log('Chart Data:', chartData);
    console.log('Chart Data Length:', chartData.length);
    console.log('First Chart Item:', chartData[0]);
    console.log('All Chart Items:', chartData.map(item => ({ name: item.name || item.eventTitle, tickets: item.tickets || item.ticketsSold })));
    
    // If no data, show a message in the PDF
    if (!data || Object.keys(data).length === 0) {
      console.log('No analytics data available');
    }
    
    // Handle pre-formatted strings from backend
    const formatCurrency = (value) => {
      if (value === null || value === undefined) return 'LKR 0';
      // If it's already a formatted string, return as is
      if (typeof value === 'string' && value.includes('LKR')) return value;
      // If it's a number, format it
      if (typeof value === 'number') return `LKR ${value.toLocaleString()}`;
      return 'LKR 0';
    };
    
    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0';
      // If it's already a formatted string, return as is
      if (typeof value === 'string') return value;
      // If it's a number, format it
      if (typeof value === 'number') return value.toLocaleString();
      return '0';
    };
    
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
          
          .summary-item.negative {
            border-left-color: #C1A37F;
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
          
          .summary-description {
            font-size: 12px;
            color: #6c757d;
            margin-top: 4px;
            line-height: 1.3;
          }
          
          .chart-section {
            margin-bottom: 40px;
          }
          
          .chart-container {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid #e9ecef;
          }
          
          .chart-container h3 {
            margin: 0 0 20px 0;
            color: #2c3e50;
            font-size: 18px;
            text-align: center;
          }
          
          .bar-chart {
            margin: 20px 0;
          }
          
          .bar-item {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .bar-label {
            min-width: 150px;
            font-size: 12px;
            color: #2c3e50;
            font-weight: 500;
            text-align: right;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .bar-wrapper {
            flex: 1;
            position: relative;
            height: 25px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            display: flex;
            align-items: center;
          }
          
          .bar-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
            position: relative;
          }
          
          .bar-value {
            position: absolute;
            right: 8px;
            font-size: 11px;
            font-weight: 600;
            color: #2c3e50;
            z-index: 2;
          }
          
          .chart-summary {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
            text-align: center;
          }
          
          .chart-summary p {
            margin: 5px 0;
            font-size: 14px;
            color: #6c757d;
          }
          
          .no-data-message {
            text-align: center;
            padding: 40px 20px;
            color: #6c757d;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px dashed #dee2e6;
          }
          
          .no-data-message p {
            margin: 10px 0;
            font-size: 14px;
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
          
          @media (max-width: 768px) {
            .summary-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            
            .bar-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
            
            .bar-label {
              min-width: auto;
              text-align: left;
              width: 100%;
            }
            
            .bar-wrapper {
              width: 100%;
            }
          }
          
          @media (max-width: 480px) {
            .summary-grid {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .chart-container {
              padding: 20px;
            }
            
            .bar-item {
              margin-bottom: 12px;
            }
            
            .bar-label {
              font-size: 11px;
            }
            
            .bar-value {
              font-size: 10px;
            }
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
              <div class="summary-value">${summary.totalRevenue || 'LKR 0'}</div>
              <div class="summary-label">Total Revenue</div>
              <div class="summary-description">From all event ticket sales</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${summary.ticketsSold || '0'}</div>
              <div class="summary-label">Tickets Sold</div>
              <div class="summary-description">Across all events</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${summary.activeEvents || '0'}</div>
              <div class="summary-label">Active Events</div>
              <div class="summary-description">Currently listed</div>
            </div>
            <div class="summary-item negative">
              <div class="summary-value">${summary.totalRefunds || 'LKR 0'}</div>
              <div class="summary-label">Total Refunds</div>
              <div class="summary-description">Processed across all events</div>
            </div>
            <div class="summary-item negative">
              <div class="summary-value">${summary.refundedTickets || '0'}</div>
              <div class="summary-label">Refunded Tickets</div>
              <div class="summary-description">Due to cancellations</div>
            </div>
          </div>
        </div>
        
        <div class="chart-section">
          <h2 class="section-title">Ticket Sales Performance</h2>
          <p>Visual representation of tickets sold per event. This chart shows the distribution of ticket sales across different events, helping identify the most popular events and areas for improvement.</p>
          
          <div class="chart-container">
            <h3>📊 Ticket Sales by Event</h3>
            ${chartData.length > 0 ? `
            <div class="bar-chart">
              ${chartData.map((event, index) => {
                // Handle both 'tickets' and 'ticketsSold' properties
                const ticketCount = event.tickets || event.ticketsSold || 0;
                const maxTickets = Math.max(...chartData.map(e => e.tickets || e.ticketsSold || 0));
                const percentage = maxTickets > 0 ? (ticketCount / maxTickets) * 100 : 0;
                
                // Debug logging for each bar
                console.log(`Bar ${index + 1}:`, {
                  eventName: event.name || event.eventTitle,
                  ticketCount: ticketCount,
                  maxTickets: maxTickets,
                  percentage: percentage
                });
                
                return `
                  <div class="bar-item">
                    <div class="bar-label">${event.name || event.eventTitle || 'Unknown Event'}</div>
                    <div class="bar-wrapper">
                      <div class="bar-fill" style="width: ${percentage}%; background-color: #C1A37F;"></div>
                      <div class="bar-value">${formatNumber(ticketCount)}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="chart-summary">
              <p><strong>Total Events:</strong> ${chartData.length}</p>
              <p><strong>Total Tickets Sold:</strong> ${formatNumber(chartData.reduce((sum, item) => sum + (item.tickets || item.ticketsSold || 0), 0))}</p>
            </div>
            ` : `
            <div class="no-data-message">
              <p>No ticket sales data available for chart visualization.</p>
              <p>This could mean there are no paid bookings or events with ticket sales yet.</p>
            </div>
            `}
          </div>
          
          <h3>Event Performance Details:</h3>
          ${chartData.length > 0 ? `
          <table class="report-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Tickets Sold</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              ${chartData.map(event => {
                const ticketCount = event.tickets || event.ticketsSold || 0;
                return `
                <tr>
                  <td>${event.name || event.eventTitle || 'Unknown Event'}</td>
                  <td>${formatNumber(ticketCount)}</td>
                  <td>${ticketCount > 100 ? '🟢 Excellent' : ticketCount > 50 ? '🟡 Good' : '🔴 Needs Attention'}</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
          ` : `
          <div class="no-data-message">
            <p>No event performance data available.</p>
            <p>Performance details will appear here once there are paid bookings.</p>
          </div>
          `}
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
              ${analyticsData.topPerformingEvents.map((event, index) => {
                // Ensure revenue is properly formatted as a number
                const revenueValue = typeof event.revenue === 'number' ? event.revenue : 
                                   typeof event.revenue === 'string' ? parseFloat(event.revenue.replace(/[^0-9.-]/g, '')) || 0 : 0;
                const formattedRevenue = `LKR ${revenueValue.toLocaleString()}`;
                
                return `
                <tr>
                  <td>${event.event}</td>
                  <td class="revenue-cell">${formattedRevenue}</td>
                  <td>${event.ticketsSold}</td>
                  <td>${index === 0 ? '🥇 Top Performer' : index === 1 ? '🥈 Runner Up' : index === 2 ? '🥉 Third Place' : '⭐ Good'}</td>
                </tr>
              `;
              }).join('')}
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
                // Ensure refund amount is properly formatted as a number
                const refundValue = typeof event.refundAmount === 'number' ? event.refundAmount : 
                                   typeof event.refundAmount === 'string' ? parseFloat(event.refundAmount.replace(/[^0-9.-]/g, '')) || 0 : 0;
                const formattedRefund = `LKR ${refundValue.toLocaleString()}`;
                const impactLevel = refundValue > 1000 ? '🔴 High Impact' : refundValue > 500 ? '🟡 Medium Impact' : '🟢 Low Impact';
                
                return `
                  <tr>
                    <td>${event.event}</td>
                    <td class="refund-cell">${formattedRefund}</td>
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
      {/* Page Header */}
      <div className="analytics-page-header">
        <h1 className="analytics-page-title">Event Analytics</h1>
        <p className="analytics-page-subtitle">Comprehensive insights and performance metrics for your events</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-content">
            <h3>Total Revenue</h3>
            <div className="card-value">{analyticsData.summary.totalRevenue}</div>
            <p>From all event ticket sales</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Tickets Sold</h3>
            <div className="card-value">{analyticsData.summary.ticketsSold}</div>
            <p>Across all events</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Active Events</h3>
            <div className="card-value">{analyticsData.summary.activeEvents}</div>
            <p>Currently listed</p>
          </div>
        </div>

        <div className="summary-card negative">
          <div className="card-content">
            <h3>Total Refunds</h3>
            <div className="card-value">{analyticsData.summary.totalRefunds}</div>
            <p>Processed across all events</p>
          </div>
        </div>

        <div className="summary-card negative">
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
                  formatter={(value) => [value, 'Tickets Sold']}
                  labelStyle={{ color: '#333' }}
                />
                <Bar dataKey="tickets" fill="#C1A37F" radius={[4, 4, 0, 0]} maxBarSize={60} />
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
                {analyticsData.topPerformingEvents.map((event, index) => {
                  // Ensure revenue is properly formatted as a number
                  const revenueValue = typeof event.revenue === 'number' ? event.revenue : 
                                     typeof event.revenue === 'string' ? parseFloat(event.revenue.replace(/[^0-9.-]/g, '')) || 0 : 0;
                  const formattedRevenue = `LKR ${revenueValue.toLocaleString()}`;
                  
                  return (
                    <tr key={index}>
                      <td>{event.event}</td>
                      <td className="revenue-cell">{formattedRevenue}</td>
                      <td>{event.ticketsSold}</td>
                    </tr>
                  );
                })}
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
                {analyticsData.refundsByEvent.map((event, index) => {
                  // Ensure refund amount is properly formatted as a number
                  const refundValue = typeof event.refundAmount === 'number' ? event.refundAmount : 
                                     typeof event.refundAmount === 'string' ? parseFloat(event.refundAmount.replace(/[^0-9.-]/g, '')) || 0 : 0;
                  const formattedRefund = `LKR ${refundValue.toLocaleString()}`;
                  
                  return (
                    <tr key={index}>
                      <td>{event.event}</td>
                      <td className="refund-amount">{formattedRefund}</td>
                      <td className="refunded-tickets">{event.ticketsRefunded}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
