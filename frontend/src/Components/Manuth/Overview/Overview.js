import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "../../MainNav/MainNav";
import OverviewHomeTab from "./OverviewHomeTab";
import OverviewAnalyticsTab from "./OverviewAnalyticsTab";
import OverviewApplicationsTab from "./OverviewApplicationsTab";
import OverviewManageArtistsTab from "./OverviewManageArtistsTab";
import logoutEmployee from "../../../utils/employeeLogout";
import "./Overview.css";

const Overview = () => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  // Sign out function
  const handleSignOut = () => {
    logoutEmployee(navigate, "/mainhome");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <div
        style={{
          background: "#34495e",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #2c3e50",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Artist Manager Dashboard
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
        <div
          style={{
            width: "220px",
            background: "#2c3e50",
            color: "white",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>
          <button onClick={() => setActiveTab("home")} style={getButtonStyle(activeTab === "home")}>Home</button>
          <button onClick={() => setActiveTab("analytics")} style={getButtonStyle(activeTab === "analytics")}>Analytics</button>
          <button onClick={() => setActiveTab("applications")} style={getButtonStyle(activeTab === "applications")}>Applications</button>
          <button onClick={() => setActiveTab("manage")} style={getButtonStyle(activeTab === "manage")}>Manage Artists</button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>
          {activeTab === "home" && <OverviewHomeTab />}
          {activeTab === "analytics" && <OverviewAnalyticsTab />}
          {activeTab === "applications" && <OverviewApplicationsTab />}
          {activeTab === "manage" && <OverviewManageArtistsTab />}
        </div>
      </div>
    </div>
  );
};

const getButtonStyle = (isActive) => ({
  background: isActive ? "#34495e" : "transparent",
  border: "none",
  color: "white",
  textAlign: "left",
  padding: "10px 0",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: isActive ? "bold" : "normal",
  width: "100%",
  marginBottom: "5px",
  borderRadius: "4px",
  transition: "background-color 0.3s",
});

export default Overview;
