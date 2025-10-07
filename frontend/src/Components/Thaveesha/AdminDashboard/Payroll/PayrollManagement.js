import React, { useEffect, useMemo, useState } from 'react';
import emailjs from 'emailjs-com';
import axios from 'axios';
import './PayrollManagement.css';

function PayrollManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ employeeName: '', email: '', role: '', salary: '' });
  const [submitting, setSubmitting] = useState(false);

  const api = useMemo(() => axios.create({ baseURL: 'http://localhost:5000/api/payroll' }), []);

  // Send salary payment confirmation email asynchronously
  const sendPaymentEmail = (employee) => {
    const templateParams = {
      employee_name: employee.name,
      email: employee.email,
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    };

    // Fire and forget; do not block UI/payment flow
    emailjs
      .send('service_pgy8fxb', 'template_xu1ud9i', templateParams, 'Imob_khk9IZWGcLjp')
      .then(
        (response) => {
          console.log('✅ Salary payment email sent:', response.status, response.text);
        },
        (error) => {
          console.error('❌ Failed to send salary payment email:', error);
        }
      );
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/');
      setItems(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch payroll:', err);
      setError('Failed to fetch payroll records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ employeeName: '', email: '', role: '', salary: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.employeeName || !form.email || !form.role || form.salary === '') return;
    try {
      setSubmitting(true);
      await api.post('/add', {
        employeeName: form.employeeName,
        email: form.email,
        role: form.role,
        salary: Number(form.salary),
      });
      closeModal();
      await fetchAll();
    } catch (err) {
      console.error('Failed to add payroll:', err);
      setError('Failed to add payroll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayment = async (id) => {
    try {
      const res = await api.post(`/${id}/create-checkout-session`, {});
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      setError('Failed to start payment');
    }
  };

  const markPaid = async (id) => {
    try {
      const res = await api.put(`/update/${id}`, { status: 'Paid' });
      setItems((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // If coming back from Stripe success, optimistically refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      const sessionId = params.get('session_id');
      if (sessionId) {
        // Verify with backend; if Paid, send email, then refresh
        api.get(`/verify/${sessionId}`)
          .then((res) => {
            if (res?.data?.ok && res?.data?.payroll && res.data.payroll.status === 'Paid') {
              const payroll = res.data.payroll;
              sendPaymentEmail({ name: payroll.employeeName, email: payroll.email });
            }
          })
          .catch(() => {})
          .finally(() => fetchAll());
      } else {
        fetchAll();
      }
    }
  }, []);

  // Summary stats derived from items
  const summary = useMemo(() => {
    const totalEmployees = items.length;
    const totalPaid = items.filter((x) => x.status === 'Paid').length;
    const totalPending = items.filter((x) => x.status !== 'Paid').length;
    const totalAmount = items.reduce((sum, x) => sum + (Number(x.salary) || 0), 0);
    const now = new Date();
    const monthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return { totalEmployees, totalPaid, totalPending, totalAmount, monthYear };
  }, [items]);

  // Client-side filter
  const [filter, setFilter] = useState('all'); // all | paid | pending
  const filteredItems = useMemo(() => {
    if (filter === 'paid') return items.filter(x => x.status === 'Paid');
    if (filter === 'pending') return items.filter(x => x.status !== 'Paid');
    return items;
  }, [items, filter]);

  // Clear confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // 'paid' | 'pending'

  const openConfirm = (status) => {
    setConfirmTarget(status);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const handleClear = async () => {
    if (!confirmTarget) return;
    try {
      await api.delete(`/clear`, { params: { status: confirmTarget } });
      closeConfirm();
      await fetchAll();
    } catch (err) {
      console.error('Failed to clear payrolls:', err);
      setError('Failed to clear payrolls');
    }
  };

  return (
    <div className="employee-management">
      <div className="section-header">
        <h1>Payroll Management</h1>
        <p className="section-subtitle">Manage monthly salaries and payouts for employees</p>
      </div>

      {/* Monthly Payroll Summary */}
      <div className="payroll-summary">
        <div className="payroll-summary-grid">
          <div className="payroll-summary-card">
            <div className="summary-label">Total Payroll This Month</div>
            <div className="summary-value">Rs. {summary.totalAmount.toLocaleString()}</div>
          </div>
          <div className="payroll-summary-card">
            <div className="summary-label">Employees Paid</div>
            <div className="summary-value">{summary.totalPaid} / {summary.totalEmployees}</div>
          </div>
          <div className="payroll-summary-card">
            <div className="summary-label">Pending Payments</div>
            <div className="summary-value">{summary.totalPending}</div>
          </div>
          <div className="payroll-summary-card">
            <div className="summary-label">Current Period</div>
            <div className="summary-value">{summary.monthYear}</div>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <div className="payroll-controls">
          <div className="payroll-filter-tabs">
            <button 
              className={`payroll-filter-tab ${filter==='all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
            >
              All ({items.length})
            </button>
            <button 
              className={`payroll-filter-tab ${filter==='paid' ? 'active' : ''}`} 
              onClick={() => setFilter('paid')}
            >
              Paid ({items.filter(r => r.status === 'Paid').length})
            </button>
            <button 
              className={`payroll-filter-tab ${filter==='pending' ? 'active' : ''}`} 
              onClick={() => setFilter('pending')}
            >
              Pending ({items.filter(r => r.status !== 'Paid').length})
            </button>
          </div>
          <div className="actions-right">
            <button className="payroll-clear-button" onClick={() => openConfirm('paid')}>Clear All Paid</button>
            <button className="payroll-clear-button" onClick={() => openConfirm('pending')}>Clear All Pending</button>
          </div>
        </div>
        <button className="btn-add" onClick={openModal}>Add Payroll Record</button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Monthly Salary</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr><td className="empty" colSpan="6">No payroll records</td></tr>
            )}
            {filteredItems.map((p) => (
              <tr key={p._id}>
                <td>{p.employeeName}</td>
                <td>{p.email}</td>
                <td>{p.role}</td>
                <td>Rs. {Number(p.salary).toLocaleString()}</td>
                <td>
                  <span className={`status ${p.status === 'Paid' ? 'active' : 'on-leave'}`}>{p.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    {p.status === 'Pending' ? (
                      <button className="btn-delete payroll-pay-btn" onClick={() => handleProcessPayment(p._id)}>Process Payment</button>
                    ) : (
                      <button className="btn-delete payroll-pay-btn" disabled>Paid</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal(); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>Add Payroll Record</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <form className="employee-form" onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee Name</label>
                  <input name="employeeName" value={form.employeeName} onChange={handleChange} type="text" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handleChange} type="email" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <input name="role" value={form.role} onChange={handleChange} type="text" required />
                </div>
                <div className="form-group">
                  <label>Fixed Monthly Salary</label>
                  <input name="salary" value={form.salary} onChange={handleChange} type="number" min="0" step="1" required />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" type="button" onClick={closeModal}>Cancel</button>
                <button className="btn-save" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeConfirm(); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Clear</h2>
              <button className="btn-close" onClick={closeConfirm}>×</button>
            </div>
            <div className="employee-form" style={{paddingTop: '0'}}>
              <p style={{margin: '0 0 16px', color: '#374151'}}>
                Are you sure you want to permanently delete all {confirmTarget} payroll records? This action cannot be undone.
              </p>
              <div className="form-actions">
                <button className="btn-cancel" type="button" onClick={closeConfirm}>Cancel</button>
                <button className="btn-save" type="button" onClick={handleClear}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollManagement;


