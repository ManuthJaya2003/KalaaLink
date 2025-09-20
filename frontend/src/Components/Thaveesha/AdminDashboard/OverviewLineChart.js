import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ChartStyles.css';

function OverviewLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>Booking Trends Over Time</h3>
        <div className="no-data">No data available</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            {payload[0].value} bookings
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3>Booking Trends Over Time</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              stroke="#666"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#666"
              tickFormatter={(value) => value.toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="registrations" 
              stroke="#667eea" 
              strokeWidth={3}
              dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OverviewLineChart;
