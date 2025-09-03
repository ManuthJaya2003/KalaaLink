import React, { useState } from "react";
import axios from "axios";
import "./ComplaintForm.css";

const API = "http://localhost:5000/complaints";

function ComplaintForm({ isOpen, onClose, onSubmitSuccess }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    Name: "",
    Gmail: "",
    Message: "",
    Complaint_Category: "General",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.Name || !form.Gmail || !form.Message || !form.Complaint_Category) {
      setError("Please fill all fields.");
      setSaving(false);
      return;
    }

    try {
      await axios.post(API, form);
      setForm({ Name: "", Gmail: "", Message: "", Complaint_Category: "General" });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to submit complaint. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({ Name: "", Gmail: "", Message: "", Complaint_Category: "General" });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Open a Complaint</h3>
          <button className="close-x" onClick={handleClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
            <label>Email</label>
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
            <button type="button" className="secondary-btn" onClick={handleClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="help-btn" disabled={saving}>
              {saving ? "Submitting…" : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComplaintForm;
