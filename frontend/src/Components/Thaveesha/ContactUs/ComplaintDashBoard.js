import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = "http://localhost:5000/complaints";

// API helpers
const api = {
  list: async () => (await axios.get(API)).data.complaints || [],
  create: async (payload) => (await axios.post(API, payload)).data.complaints,
  update: async (id, payload) =>
    (await axios.put(`${API}/${id}`, payload)).data.complaints,
  remove: async (id) =>
    (await axios.delete(`${API}/${id}`)).data.complaints,
};

function ComplaintDashBoard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if accessed from admin dashboard
  const isFromAdmin = location.state?.fromAdmin || false;

  // modal + form
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    Name: "",
    Gmail: "",
    Message: "",
    Complaint_Category: "General",
  });
  const isEdit = useMemo(() => Boolean(editingId), [editingId]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await api.list();
      setComplaints(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      setErr("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    
    // Real-time updates every 10 seconds for flashcards
    const interval = setInterval(loadComplaints, 10000);
    return () => clearInterval(interval);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ Name: "", Gmail: "", Message: "", Complaint_Category: "General" });
    setIsOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      Name: c.Name || "",
      Gmail: c.Gmail || "",
      Message: c.Message || "",
      Complaint_Category: c.Complaint_Category || "General",
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSaving(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");

    if (!form.Name || !form.Gmail || !form.Message || !form.Complaint_Category) {
      setErr("Please fill all fields.");
      setSaving(false);
      return;
    }

    try {
      if (isEdit) {
        await api.update(editingId, form);
      } else {
        await api.create(form);
      }
      await loadComplaints();
      closeModal();
    } catch (e) {
      console.error(e);
      setErr("Failed to save complaint.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint permanently?")) return;
    try {
      await api.remove(id);
      await loadComplaints();
    } catch (e) {
      console.error(e);
      setErr("Failed to delete complaint.");
    }
  };

  const downloadPdf = () => {
    if (!complaints.length) {
      alert("No complaints to export.");
      return;
    }

    setGeneratingPdf(true);
    try {
      const doc = new jsPDF("p", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header with gradient-like effect using rectangles
      doc.setFillColor(139, 92, 246); // Purple background
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      // Company logo/name with white text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("🎵 KalaaLink", pageWidth / 2, 35, { align: "center" });
      
      // Subtitle
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("Customer Complaints Management Report", pageWidth / 2, 55, { align: "center" });
      
      // Generation timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 70, { align: "center" });
      
      // Reset text color for content
      doc.setTextColor(0, 0, 0);

    // Build rows with status information
    const rows = complaints.map((c, index) => {
      let status = "Pending";
      if (c.status) {
        status = c.status;
      } else if (c.resolved) {
        status = "Accepted";
      } else if (c.rejected) {
        status = "Rejected";
      }
      
      return [
        `CMP${(index + 1).toString().padStart(3, '0')}`,
        c.Name || "",
        c.Gmail || "",
        c.Complaint_Category || "",
        (c.Message || "").replace(/\s+/g, " ").substring(0, 80) + (c.Message && c.Message.length > 80 ? "..." : ""),
        status,
        new Date(c.createdAt || c.updatedAt).toLocaleDateString()
      ];
    });

      // Add summary statistics with professional styling
      const totalComplaints = complaints.length;
      const pendingComplaints = complaints.filter(c => 
        (c.status === 'Pending' || (!c.status && !c.resolved && !c.rejected))
      ).length;
      const resolvedComplaints = complaints.filter(c => 
        c.status === 'Accepted' || c.resolved
      ).length;
      const rejectedComplaints = complaints.filter(c => 
        c.status === 'Rejected' || c.rejected
      ).length;

      // Summary section with background
      doc.setFillColor(248, 249, 250);
      doc.rect(40, 100, pageWidth - 80, 80, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(40, 100, pageWidth - 80, 80, 'S');

      // Summary title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text("📊 Executive Summary", 50, 120);

      // Statistics in a grid layout
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      // First row of stats
      doc.setTextColor(17, 24, 39);
      doc.text(`Total Complaints: ${totalComplaints}`, 50, 140);
      doc.text(`Pending: ${pendingComplaints}`, 200, 140);
      
      // Second row of stats
      doc.setTextColor(16, 185, 129); // Green for resolved
      doc.text(`Resolved: ${resolvedComplaints}`, 50, 155);
      doc.setTextColor(220, 53, 69); // Red for rejected
      doc.text(`Rejected: ${rejectedComplaints}`, 200, 155);
      
      // Resolution rate
      const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0;
      doc.setTextColor(139, 92, 246); // Purple
      doc.setFont("helvetica", "bold");
      doc.text(`Resolution Rate: ${resolutionRate}%`, 50, 170);

      // Table with professional styling
      autoTable(doc, {
        head: [["ID", "Name", "Email", "Category", "Message", "Status", "Date"]],
        body: rows,
        startY: 200,
        margin: { left: 40, right: 40 },
        tableWidth: 'auto',
        pageBreak: 'auto',
        showHead: 'everyPage',
        styles: { 
          fontSize: 8, 
          cellPadding: 4, 
          valign: "top",
          lineColor: [220, 220, 220],
          lineWidth: 0.5,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 35, halign: 'center' },  // ID
          1: { cellWidth: 65, halign: 'left' },    // Name
          2: { cellWidth: 90, halign: 'left' },   // Email
          3: { cellWidth: 55, halign: 'center' },  // Category
          4: { cellWidth: 110, halign: 'left' },   // Message
          5: { cellWidth: 45, halign: 'center' },  // Status
          6: { cellWidth: 55, halign: 'center' },  // Date
        },
        didDrawCell: (data) => {
          // Color code status cells
          if (data.column.index === 5) { // Status column
            const status = data.cell.text[0];
            if (status === 'Accepted' || status === 'Resolved') {
              doc.setFillColor(212, 237, 218);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            } else if (status === 'Rejected') {
              doc.setFillColor(248, 215, 218);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            } else if (status === 'Pending') {
              doc.setFillColor(255, 243, 205);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            }
          }
        },
        didDrawPage: (data) => {
          // Professional footer
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          
          // Footer line
          doc.setDrawColor(200, 200, 200);
          doc.line(40, pageHeight - 40, pageSize.width - 40, pageHeight - 40);
          
          // Footer content
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text("KalaaLink Customer Complaints Management System", 40, pageHeight - 25);
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageSize.width - 80, pageHeight - 25, { align: "right" });
          doc.text(`Generated: ${new Date().toLocaleString()}`, pageSize.width / 2, pageHeight - 15, { align: "center" });
        },
      });

      // Add insights section if there's space
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 200;
      if (finalY < pageHeight - 150) {
        // Insights section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(55, 65, 81);
        doc.text("💡 Key Insights & Recommendations", 40, finalY + 30);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(75, 85, 99);
        
        let insightsY = finalY + 50;
        
        // Generate insights based on data
        if (resolutionRate > 80) {
          doc.text("• Excellent resolution rate indicates effective complaint handling", 40, insightsY);
          insightsY += 15;
        } else if (resolutionRate > 60) {
          doc.text("• Good resolution rate with room for improvement", 40, insightsY);
          insightsY += 15;
        } else {
          doc.text("• Resolution rate needs attention - consider process improvements", 40, insightsY);
          insightsY += 15;
        }

        if (pendingComplaints > totalComplaints * 0.3) {
          doc.text("• High number of pending complaints - prioritize response time", 40, insightsY);
          insightsY += 15;
        }

        if (rejectedComplaints > totalComplaints * 0.2) {
          doc.text("• Consider reviewing rejection criteria and communication", 40, insightsY);
          insightsY += 15;
        }

        // Add general recommendations
        doc.text("• Implement automated status updates for better customer communication", 40, insightsY);
        insightsY += 15;
        doc.text("• Regular review of complaint categories to identify trends", 40, insightsY);
        insightsY += 15;
        doc.text("• Consider proactive customer feedback collection", 40, insightsY);
      }

      // Save with professional filename
      const dateTag = new Date().toISOString().slice(0, 10);
      const timeTag = new Date().toISOString().slice(11, 19).replace(/:/g, '-');
      doc.save(`KalaaLink_Complaints_Report_${dateTag}_${timeTag}.pdf`);
      
      // Show success message
      setErr("PDF report generated successfully!");
      setTimeout(() => setErr(''), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErr("Failed to generate PDF report. Please try again.");
      setTimeout(() => setErr(''), 5000);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Helper functions for status and actions
  const getStatusClass = (complaint) => {
    if (complaint.status) {
      return complaint.status.toLowerCase();
    }
    if (complaint.resolved) return 'accepted';
    if (complaint.rejected) return 'rejected';
    return 'pending';
  };

  const getStatusText = (complaint) => {
    if (complaint.status) {
      return complaint.status;
    }
    if (complaint.resolved) return 'Accepted';
    if (complaint.rejected) return 'Rejected';
    return 'Pending';
  };

  const getActionButtons = (complaint) => {
    const isProcessed = complaint.status === 'Accepted' || complaint.status === 'Rejected' || 
                       complaint.resolved || complaint.rejected;
    
    return (
      <div className="action-buttons">
        {!isProcessed && (
          <>
            <button 
              className="btn-accept"
              onClick={() => handleStatusUpdate(complaint._id, 'Accepted')}
            >
              Accept
            </button>
            <button 
              className="btn-reject"
              onClick={() => handleStatusUpdate(complaint._id, 'Rejected')}
            >
              Reject
            </button>
          </>
        )}
        <button 
          className="btn-clear"
          onClick={() => handleClearComplaint(complaint._id)}
          title="Clear this complaint"
        >
          Clear
        </button>
      </div>
    );
  };

  const handleStatusUpdate = async (complaintId, status) => {
    try {
      setLoading(true);
      setErr(''); // Clear any previous errors
      
      const updateData = {};
      if (status === 'Accepted') {
        updateData.status = 'Accepted';
        updateData.resolved = true;
        updateData.rejected = false;
      } else if (status === 'Rejected') {
        updateData.status = 'Rejected';
        updateData.resolved = false;
        updateData.rejected = true;
      }
      
      console.log('Updating complaint:', complaintId, 'with data:', updateData);
      
      const response = await api.update(complaintId, updateData);
      console.log('Update response:', response);
      
      await loadComplaints();
      console.log('Complaints reloaded successfully');
      
      // Show success message
      setErr(`Complaint ${status} successfully!`);
      setTimeout(() => setErr(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setErr(`Failed to update complaint status: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to clear this complaint?")) return;
    
    try {
      setLoading(true);
      setErr('');
      
      await api.remove(complaintId);
      await loadComplaints();
      
      setErr("Complaint cleared successfully!");
      setTimeout(() => setErr(''), 3000);
    } catch (error) {
      console.error('Error clearing complaint:', error);
      setErr(`Failed to clear complaint: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkClear = async (status) => {
    const statusText = status === 'Accepted' ? 'accepted' : 'rejected';
    if (!window.confirm(`Are you sure you want to clear all ${statusText} complaints?`)) return;
    
    try {
      setLoading(true);
      setErr('');
      
      const response = await axios.post(`${API}/bulk-clear`, { status });
      await loadComplaints();
      
      setErr(response.data.message || `All ${statusText} complaints cleared successfully!`);
      setTimeout(() => setErr(''), 3000);
    } catch (error) {
      console.error('Error bulk clearing complaints:', error);
      setErr(`Failed to clear ${statusText} complaints: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaints-dashboard">
      {/* Admin Dashboard Style Header */}
      {isFromAdmin && (
        <div className="admin-dashboard">
          <div className="admin-header">
            <h1>Customer Complaints Management</h1>
            <div className="admin-actions">
              <button 
                className="btn-back-to-admin"
                onClick={() => navigate('/admindashboard')}
                title="Return to Admin Dashboard"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Admin
              </button>
            </div>
          </div>

          <div className="admin-navigation">
            <nav className="admin-nav">
              <button className="nav-item active">
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <path d="M13 8H7"/>
                  <path d="M17 12H7"/>
                </svg>
                <span>Complaints Overview</span>
              </button>
              <div className="nav-stats">
                <div className="nav-stat-item">
                  <span className="nav-stat-number">{complaints.length}</span>
                  <span className="nav-stat-label">Total</span>
                </div>
                <div className="nav-stat-item pending">
                  <span className="nav-stat-number">{complaints.filter(c => 
                    c.status === 'Pending' || (!c.status && !c.resolved && !c.rejected)
                  ).length}</span>
                  <span className="nav-stat-label">Pending</span>
                </div>
                <div className="nav-stat-item resolved">
                  <span className="nav-stat-number">{complaints.filter(c => 
                    c.status === 'Accepted' || c.resolved
                  ).length}</span>
                  <span className="nav-stat-label">Accepted</span>
                </div>
                <div className="nav-stat-item rejected">
                  <span className="nav-stat-number">{complaints.filter(c => 
                    c.status === 'Rejected' || c.rejected
                  ).length}</span>
                  <span className="nav-stat-label">Rejected</span>
                </div>
                <div 
                  className="nav-stat-item last-updated"
                  title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
                >
                  <span className="nav-stat-number">🔄</span>
                  <span className="nav-stat-label">Live</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
      
      {err && <div className={`error-banner ${err.includes('successfully') ? 'success' : ''}`}>{err}</div>}

      {/* Professional Complaints Dashboard */}
      <div className="professional-complaints-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h2>Logged Complaints</h2>
              <p>Review and address all user complaints from this panel.</p>
            </div>
            <div className="header-actions">
              <button className="btn-refresh" onClick={loadComplaints} disabled={loading}>
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </button>
              <button 
                className="btn-download" 
                onClick={downloadPdf} 
                disabled={!complaints.length || generatingPdf}
              >
                {generatingPdf ? "⏳ Generating..." : "📄 Download PDF"}
              </button>
              <button 
                className="btn-bulk-clear-accepted" 
                onClick={() => handleBulkClear('Accepted')}
                disabled={loading || !complaints.some(c => c.status === 'Accepted' || c.resolved)}
                title="Clear all accepted complaints"
              >
                🗑️ Clear Accepted
              </button>
              <button 
                className="btn-bulk-clear-rejected" 
                onClick={() => handleBulkClear('Rejected')}
                disabled={loading || !complaints.some(c => c.status === 'Rejected' || c.rejected)}
                title="Clear all rejected complaints"
              >
                🗑️ Clear Rejected
              </button>
            </div>
          </div>
        </div>

        <div className="complaints-table-container">
          <table className="professional-complaints-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Customer</th>
                <th>Complaint</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <div className="loading-spinner">Loading complaints...</div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <p>No complaints found</p>
                      <button className="btn-create-complaint" onClick={openCreate}>
                        Create First Complaint
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((complaint, index) => (
                  <tr key={complaint._id} className="complaint-row">
                    <td className="complaint-id">
                      CMP{(index + 1).toString().padStart(3, '0')}
                    </td>
                    <td className="customer-info">
                      <div className="customer-name">{complaint.Name}</div>
                      <div className="customer-email">{complaint.Gmail}</div>
                    </td>
                    <td className="complaint-description">
                      {complaint.Message}
                    </td>
                    <td className="complaint-date">
                      {new Date(complaint.createdAt || complaint.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="complaint-status">
                      <span className={`status-badge ${getStatusClass(complaint)}`}>
                        {getStatusText(complaint)}
                      </span>
                    </td>
                    <td className="complaint-actions">
                      {getActionButtons(complaint)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal */}
      {isOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{isEdit ? "Edit Complaint" : "Open a Complaint"}</h3>
              <button className="close-x" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-field">
                <label>Name</label>
                <input
                  type="text"
                  value={form.Name}
                  onChange={(e) => setForm({ ...form, Name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-field">
                <label>Gmail</label>
                <input
                  type="email"
                  value={form.Gmail}
                  onChange={(e) => setForm({ ...form, Gmail: e.target.value })}
                  placeholder="yourname@gmail.com"
                  required
                />
              </div>

              <div className="form-field">
                <label>Category</label>
                <select
                  value={form.Complaint_Category}
                  onChange={(e) =>
                    setForm({ ...form, Complaint_Category: e.target.value })
                  }
                  required
                >
                  <option>General</option>
                  <option>Billing</option>
                  <option>Technical</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-field span-2">
                <label>Message</label>
                <textarea
                  rows="5"
                  value={form.Message}
                  onChange={(e) => setForm({ ...form, Message: e.target.value })}
                  placeholder="Describe your issue…"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="help-btn" disabled={saving}>
                  {saving ? (isEdit ? "Saving…" : "Submitting…") : isEdit ? "Save" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintDashBoard;
