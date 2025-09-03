import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
    } catch (e) {
      console.error(e);
      setErr("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
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

    const doc = new jsPDF("p", "pt", "a4");

    // Title
    doc.setFontSize(16);
    doc.text("KalaaLink — Complaints Report", 40, 40);

    // Optional subtitle / date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    // Build rows
    const rows = complaints.map((c) => [
      c.Name || "",
      c.Gmail || "",
      c.Complaint_Category || "",
      (c.Message || "").replace(/\s+/g, " "),
    ]);

    // Table
    doc.autoTable({
      head: [["Name", "Gmail", "Category", "Message"]],
      body: rows,
      startY: 72,
      styles: { fontSize: 10, cellPadding: 6, valign: "top" },
      columnStyles: {
        0: { cellWidth: 110 }, // Name
        1: { cellWidth: 150 }, // Gmail
        2: { cellWidth: 90 },  // Category
        3: { cellWidth: 170 }, // Message
      },
      didDrawPage: (data) => {
        // Footer page number
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(9);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          pageSize.width - 80,
          pageHeight - 20
        );
      },
    });

    // Save
    const dateTag = new Date().toISOString().slice(0, 10);
    doc.save(`complaints_${dateTag}.pdf`);
  };

  return (
    <div className="complaints-dashboard">
      {err && <div className="error-banner">{err}</div>}

      {/* Complaints Table */}
      <section className="complaints-section">
        <div className="section-head">
          <h3>Complaints</h3>
          <button className="help-btn" onClick={openCreate}>
            Open A Complaint
          </button>
          <button className="secondary-btn" onClick={loadComplaints} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="secondary-btn" onClick={downloadPdf} disabled={!complaints.length}>
            Download PDF
          </button>
        </div>

        <div className="table-wrap">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Gmail</th>
                <th>Category</th>
                <th>Message</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="empty">
                    No complaints yet. Click "Open A Complaint" to add one.
                  </td>
                </tr>
              )}
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.Name}</td>
                  <td>{c.Gmail}</td>
                  <td>{c.Complaint_Category}</td>
                  <td className="message-cell">{c.Message}</td>
                  <td className="actions">
                    <button className="link-btn" onClick={() => openEdit(c)}>Edit</button>
                    <button className="link-btn danger" onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan="5" className="empty">Loading…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
