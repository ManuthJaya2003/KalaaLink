import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ChartStyles.css';

function OverviewBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>Key Metrics Comparison</h3>
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
            {label === 'Revenue' ? `LKR ${payload[0].value.toLocaleString()}` : payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3>Key Metrics Comparison</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => value.toLocaleString()}
              stroke="#666"
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={80}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#667eea"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OverviewBarChart;
