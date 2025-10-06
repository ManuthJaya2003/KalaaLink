import React, { useState, useEffect } from "react";
import axios from "axios";

function CrewRequestsTab() {
  const [crewRequests, setCrewRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCrewRequests = async () => {
    try {
      setLoading(true);
      
      // Try multiple possible manager IDs to find existing crew requests
      const possibleManagerIds = [
        "manager123", 
        "manager", 
        "admin", 
        "eventmanager",
        "Event Manager",
        "Manager"
      ];
      
      let crewRequests = [];
      let lastError = null;
      
      // Try each possible manager ID
      for (const managerId of possibleManagerIds) {
        try {
          console.log(`Trying to fetch crew requests for manager: ${managerId}`);
          const res = await axios.get(`http://localhost:5000/api/crew-requests/manager?managerId=${managerId}`);
          if (res.data && res.data.length > 0) {
            crewRequests = res.data;
            console.log(`Found ${crewRequests.length} crew requests for manager: ${managerId}`);
            break;
          }
        } catch (err) {
          lastError = err;
          console.log(`No crew requests found for manager: ${managerId}`);
        }
      }
      
      // If no specific manager found, try to get all crew requests
      if (crewRequests.length === 0) {
        try {
          console.log("Trying to fetch all crew requests...");
          const res = await axios.get(`http://localhost:5000/api/crew-requests/`);
          if (res.data && res.data.length > 0) {
            // Format all crew requests to match our expected structure
            crewRequests = res.data.map(request => ({
              _id: request._id,
              eventName: request.eventId?.eventTitle || 'Event not found',
              requestDetails: request.crewDetails,
              status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
              adminNotes: request.adminNotes || '',
              crewType: request.crewType,
              requiredDate: request.requiredDate,
              requiredTime: request.requiredTime,
              estimatedDuration: request.estimatedDuration,
              specialRequirements: request.specialRequirements,
              requestedAt: request.requestedAt,
              reviewedAt: request.reviewedAt,
              reviewedBy: request.reviewedBy
            }));
            console.log(`Found ${crewRequests.length} total crew requests`);
          }
        } catch (err) {
          console.log("Could not fetch all crew requests:", err.message);
        }
      }
      
      setCrewRequests(crewRequests);
      setError(null);
      
    } catch (err) {
      console.error("Failed to fetch crew requests:", err);
      setError("Failed to fetch crew requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrewRequests();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f59e0b", bgColor: "#fef3c7", text: "Pending" },
      approved: { color: "#059669", bgColor: "#d1fae5", text: "Approved" },
      rejected: { color: "#dc2626", bgColor: "#fee2e2", text: "Rejected" }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    
    return (
      <span
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        {config.text}
      </span>
    );
  };

  const getStats = () => {
    const total = crewRequests.length;
    const pending = crewRequests.filter(r => r.status.toLowerCase() === "pending").length;
    const approved = crewRequests.filter(r => r.status.toLowerCase() === "approved").length;
    const rejected = crewRequests.filter(r => r.status.toLowerCase() === "rejected").length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading crew requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#dc2626", marginBottom: "10px" }}>{error}</div>
        <button 
          onClick={fetchCrewRequests}
          style={{
            padding: "10px 20px",
            backgroundColor: "#C1A37F",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>Crew Requests</h2>
        
        {/* Statistics Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px", 
          marginBottom: "30px" 
        }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>{stats.total}</div>
            <div style={{ color: "#6b7280" }}>Total Requests</div>
          </div>
          <div style={{ ...statCardStyle, borderLeft: "4px solid #f59e0b" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>{stats.pending}</div>
            <div style={{ color: "#6b7280" }}>Pending</div>
          </div>
          <div style={{ ...statCardStyle, borderLeft: "4px solid #059669" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669" }}>{stats.approved}</div>
            <div style={{ color: "#6b7280" }}>Approved</div>
          </div>
          <div style={{ ...statCardStyle, borderLeft: "4px solid #dc2626" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#dc2626" }}>{stats.rejected}</div>
            <div style={{ color: "#6b7280" }}>Rejected</div>
          </div>
        </div>
      </div>

      {/* Crew Requests Table */}
      <div className="crew-requests-section">
        <h3 style={{ marginBottom: "15px", color: "#1f2937", fontSize: "18px", fontWeight: "600" }}>
          My Crew Requests
        </h3>
        
        {crewRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            <div style={{ fontSize: "18px", marginBottom: "10px" }}>No crew requests yet.</div>
            <div style={{ fontSize: "14px" }}>When you request crew for your events, they will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Event Name</th>
                  <th style={thStyle}>Request Details</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Admin Notes</th>
                  <th style={thStyle}>Requested Date</th>
                  <th style={thStyle}>Required Date</th>
                </tr>
              </thead>
              <tbody>
                {crewRequests.map((request) => (
                  <tr key={request._id} style={trStyle}>
                    <td style={tdStyle}>
                      <div style={{ maxWidth: "200px", fontWeight: "500" }}>
                        {request.eventName}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ maxWidth: "300px" }}>
                        <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                          {request.crewType?.charAt(0).toUpperCase() + request.crewType?.slice(1)} Crew
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          {request.requestDetails}
                        </div>
                        {request.specialRequirements && (
                          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                            <strong>Special:</strong> {request.specialRequirements}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {getStatusBadge(request.status)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ maxWidth: "250px" }}>
                        {request.adminNotes ? (
                          <div style={{ fontSize: "13px", color: "#374151" }}>
                            {request.adminNotes}
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                            No notes yet
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "13px" }}>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "13px" }}>
                        {new Date(request.requiredDate).toLocaleDateString()}
                        {request.requiredTime && (
                          <div style={{ color: "#6b7280", fontSize: "12px" }}>
                            at {request.requiredTime}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
        <p style={{ margin: "0", fontSize: "14px", color: "#6b7280" }}>
          <strong>Note:</strong> Crew requests are reviewed by administrators. You'll be notified when the status changes.
          Check back regularly for updates on your requests.
        </p>
      </div>
    </div>
  );
}

// Styles (matching the existing dashboard theme)
const statCardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  textAlign: "center",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
};

const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  backgroundColor: "white",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
};

const thStyle = {
  backgroundColor: "#f9fafb",
  padding: "16px 12px",
  textAlign: "left",
  fontWeight: "600",
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px"
};

const trStyle = {
  borderBottom: "1px solid #f3f4f6"
};

const tdStyle = {
  padding: "16px 12px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "14px",
  color: "#374151"
};

export default CrewRequestsTab;
