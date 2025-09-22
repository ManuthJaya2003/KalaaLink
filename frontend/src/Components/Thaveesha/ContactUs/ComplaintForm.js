import React, { useState } from "react";
import axios from "axios";
import "./ComplaintForm.css";

const API = "http://localhost:5000/complaints";

function ComplaintForm({ isOpen, onClose, onSubmitSuccess }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
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
    setValidationErrors({});

    // Validate Name field
    const nameError = validateName(form.Name);
    if (nameError) {
      setValidationErrors({ Name: nameError });
      setError("Please fix the validation errors before proceeding");
      setSaving(false);
      return;
    }

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
    setValidationErrors({});
    onClose();
  };

  // Validation function
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      return "Name is required";
    }
    if (!nameRegex.test(name)) {
      return "Name should only contain letters and spaces";
    }
    return "";
  };

  // Real-time validation handler for Name field
  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, Name: value });
    
    // Clear error when user starts typing
    if (validationErrors.Name) {
      setValidationErrors({...validationErrors, Name: ''});
    }
    
    // Real-time validation (only show errors after user has started typing)
    if (value.length > 0) {
      const validationError = validateName(value);
      if (validationError) {
        setValidationErrors({...validationErrors, Name: validationError});
      }
    }
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
              onChange={handleNameChange}
              placeholder="Your name"
              required
              className={validationErrors.Name ? 'error' : ''}
            />
            {validationErrors.Name && (
              <span className="error-message">{validationErrors.Name}</span>
            )}
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
