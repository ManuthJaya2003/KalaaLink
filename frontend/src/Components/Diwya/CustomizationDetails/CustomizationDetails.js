import React, { useEffect, useState } from "react";
import axios from "axios";
import MainNav from '../../MainNav/MainNav';
import MainFooter from '../../MainFooter/MainFooter';

const URL = "http://localhost:5000/api/customizations"; // Updated: changed /customization to /customizations

const CustomizationDetails = () => {
  const [customizations, setCustomizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchHandler = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(URL);

      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data && Array.isArray(res.data.customizations)) {
        data = res.data.customizations;
      } else if (res.data && typeof res.data === "object") {
        data = [res.data];
      }

      setCustomizations(data);
      setError("");
    } catch (err) {
      console.error("Error fetching customization details:", {
        message: err.message,
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(`Failed to load customization requests from ${err.config?.url}: ${err.response?.status || 'No status'}`);
      setCustomizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    try {
      setCustomizations(prev => prev.filter(item => item._id !== requestId));
      await axios.delete(`${URL}/${requestId}`);
      alert("Request deleted successfully!");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request");
      fetchHandler();
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`${URL}/${requestId}`, { status: 'approved' });
      setCustomizations(prev =>
        prev.map(item => item._id === requestId ? { ...item, status: 'approved' } : item)
      );
      alert("Request approved successfully!");
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
      fetchHandler();
    }
  };

  const downloadAsPDF = async (request) => {
    try {
      const response = await axios.get(`${URL}/${request._id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customization-report-${request._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  useEffect(() => {
    fetchHandler();
  }, []);

  const customizationList = Array.isArray(customizations) ? customizations : [];

  const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f9fafb", padding: "24px" },
    header: { textAlign: "center", marginBottom: "32px", padding: "20px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    title: { fontSize: "28px", fontWeight: "bold", color: "#2d3748" },
    card: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", padding: "24px", marginBottom: "24px" },
    button: { padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", margin: "4px" },
    buttonPrimary: { backgroundColor: "#4299e1", color: "white" },
    buttonSuccess: { backgroundColor: "#48bb78", color: "white" },
    buttonDanger: { backgroundColor: "#f56565", color: "white" },
    badge: (status) => ({ display: "inline-flex", alignItems: "center", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: status === "approved" ? "#c6f6d5" : "#bee3f8", color: status === "approved" ? "#2f855a" : "#3182ce" }),
    actionBar: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "2px solid #e2e8f0", marginTop: "24px" },
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { background: "white", padding: "30px", borderRadius: "12px", width: "600px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" },
  };

  if (isLoading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div className="customization-details-page">
      <MainNav />
      <main className="customization-details-main" style={styles.container}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>🎨 Customization Requests</h1>
            <p>📊 {customizationList.length} request(s) found</p>
          </div>

          {/* Requests */}
          {customizationList.length === 0 ? (
            <p style={{ textAlign: "center" }}>No Customization Requests</p>
          ) : (
            customizationList.map((custom) => (
              <div key={custom._id} style={styles.card}>
                <h3>👤 {custom.customerName || "Unknown Customer"}</h3>
                <p>📧 {custom.customerEmail || "No email"}</p>
                <p>📅 {custom.createdAt ? new Date(custom.createdAt).toLocaleDateString() : "Unknown"}</p>
                <span style={styles.badge(custom.status)}>{custom.status === "approved" ? "✅ Approved" : "⏳ Pending"}</span>

                <div style={styles.actionBar}>
                  <div>
                    <button onClick={() => downloadAsPDF(custom)} style={{ ...styles.button, ...styles.buttonPrimary }}>📄 PDF</button>
                    <button onClick={() => setSelectedRequest(custom)} style={{ ...styles.button, ...styles.buttonPrimary }}>👁 View Details</button>
                  </div>
                  <div>
                    <button onClick={() => handleApprove(custom._id)} style={{ ...styles.button, ...styles.buttonSuccess }}>✅ Approve</button>
                    <button onClick={() => handleDelete(custom._id)} style={{ ...styles.button, ...styles.buttonDanger }}>❌ Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Refresh */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button onClick={fetchHandler} style={{ ...styles.button, ...styles.buttonPrimary }}>🔄 Refresh Requests</button>
          </div>
        </div>

        {/* Modal */}
        {selectedRequest && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2>Request Details</h2>
              <p><strong>Customer:</strong> {selectedRequest.customerName}</p>
              <p><strong>Email:</strong> {selectedRequest.customerEmail}</p>
              <p><strong>Submitted:</strong> {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "Unknown"}</p>
              <p><strong>Description:</strong> {selectedRequest.description || "N/A"}</p>
              <p><strong>Notes:</strong> {selectedRequest.additionalNotes || "N/A"}</p>
              <p><strong>Preferences:</strong></p>
              <ul>
                {selectedRequest.preferredSize && <li>Size: {selectedRequest.preferredSize}</li>}
                {selectedRequest.preferredArtType && <li>Art Type: {selectedRequest.preferredArtType}</li>}
                {selectedRequest.preferredArtistStyle && <li>Artist Style: {selectedRequest.preferredArtistStyle}</li>}
                {selectedRequest.budget && <li>Budget: ${selectedRequest.budget}</li>}
              </ul>
              {selectedRequest.preferredColorPalette?.length > 0 && <p><strong>Colors:</strong> {selectedRequest.preferredColorPalette.join(", ")}</p>}

              <div style={{ textAlign: "right", marginTop: "20px" }}>
                <button onClick={() => setSelectedRequest(null)} style={{ ...styles.button, ...styles.buttonDanger }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
};

export default CustomizationDetails;

