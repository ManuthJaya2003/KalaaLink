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
  Legend,
} from "recharts";

function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/bookings/analytics");
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Customer Bookings per Event</h2>
      {analyticsData.length === 0 ? (
        <p>No booking data available</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analyticsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="eventName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="customerBookings" fill="#8884d8" name="Customer Bookings" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default AnalyticsTab;
