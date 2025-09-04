import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Orders.css';

const ORDER_URL = 'http://localhost:5000/api/orders';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(ORDER_URL);
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkWebhookStatus = async () => {
    try {
      const response = await axios.get(`${ORDER_URL}/webhook/test`);
      setWebhookStatus(response.data);
      
      // Log webhook status for debugging
      if (response.data.hasWebhookSecret) {
        console.log('✅ Webhook properly configured - automatic payment updates enabled');
      } else {
        console.log('❌ Webhook secret missing - automatic payment updates disabled');
        console.log('📝 Please add STRIPE_WEBHOOK_SECRET to your .env file');
      }
    } catch (error) {
      console.error('Error checking webhook status:', error);
      setWebhookStatus({ success: false, error: error.message });
    }
  };

  useEffect(() => {
    fetchOrders();
    checkWebhookStatus();
  }, []);

  useEffect(() => {
    let filtered = [...orders];
    if (filterBy !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filterBy);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'status':
          aValue = a.paymentStatus;
          bValue = b.paymentStatus;
          break;
        case 'amount':
          aValue = a.totalAmount || a.amount || 0;
          bValue = b.totalAmount || b.amount || 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredOrders(filtered);
  }, [orders, sortBy, sortOrder, filterBy]);

  const handleRefresh = () => fetchOrders();

  const handleUpdatePaymentStatus = async (orderId, newStatus, reason) => {
    try {
      setUpdateLoading(true);
      await axios.put(`${ORDER_URL}/${orderId}/payment-status`, {
        paymentStatus: newStatus,
        reason: reason || 'Manual update by admin'
      });
      await fetchOrders();
      setShowUpdateModal(false);
      setSelectedOrder(null);
      alert(`Payment status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setShowUpdateModal(true);
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'status-badge status-paid';
      case 'pending': return 'status-badge status-pending';
      case 'failed': return 'status-badge status-failed';
      case 'cancelled': return 'status-badge status-cancelled';
      case 'refunded': return 'status-badge status-refunded';
      default: return 'status-badge status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const renderOrderItems = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.map((item, index) => (
        <div key={index} className="order-item">
          <div className="order-item-image">
            {item.productImage ? <img src={item.productImage} alt={item.productName} /> : <div className="no-image">No Image</div>}
          </div>
          <div className="order-item-details">
            <h4>{item.productName || 'Unknown Product'}</h4>
            <p>Quantity: {item.quantity}</p>
            <p>Price: {formatCurrency(item.price)}</p>
            <p className="item-subtotal">Subtotal: {formatCurrency(item.price * item.quantity)}</p>
          </div>
        </div>
      ));
    } else {
      return (
        <div className="order-item">
          <div className="order-item-details">
            <h4>Legacy Product</h4>
            <p>Product ID: {order.productId || 'N/A'}</p>
            <p>Quantity: {order.quantity || 'N/A'}</p>
          </div>
        </div>
      );
    }
  };

  const renderTableView = () => (
    <div className="orders-table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Total</th>
            <th>Payment Status</th>
            <th>Order Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id}>
              <td>{order._id.slice(-8)}</td>
              <td>
                <div>{order.customerName || 'N/A'}</div>
                <div>{order.customerEmail || 'N/A'}</div>
              </td>
              <td>{order.items ? order.items.length : 1} item(s)</td>
              <td>{formatCurrency(order.totalAmount || order.amount)}</td>
              <td><span className={getPaymentStatusClass(order.paymentStatus)}>{order.paymentStatus || 'pending'}</span></td>
              <td>{formatDate(order.createdAt)}</td>
              <td>
                <button onClick={() => console.log('View details for order:', order._id)}>View Details</button>
                <button onClick={() => openUpdateModal(order)}>Update Status</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className="orders-cards-container">
      {filteredOrders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-card-header">
            <div>Order ID: {order._id.slice(-8)}</div>
            <span className={getPaymentStatusClass(order.paymentStatus)}>{order.paymentStatus || 'pending'}</span>
          </div>
          <div className="order-card-body">
            <h4>Customer: {order.customerName || 'N/A'}</h4>
            <div className="order-items-list">{renderOrderItems(order)}</div>
            <div>Total: {formatCurrency(order.totalAmount || order.amount)}</div>
            {order.paidAt && <div>Paid At: {formatDate(order.paidAt)}</div>}
          </div>
          <div className="order-card-footer">
            <button onClick={() => console.log('View details for order:', order._id)}>View Details</button>
            <button onClick={() => openUpdateModal(order)}>Update Status</button>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) return <div className="loading-container"><p>Loading orders...</p></div>;
  if (error) return <div className="error-container"><p>{error}</p><button onClick={handleRefresh}>Retry</button></div>;

  return (
    <div className="orders-container">
      {/* Header */}
      <div className="orders-header">
        <h2>Orders Management</h2>
        <p>Manage and track all marketplace orders</p>
                 {webhookStatus && (
           <div className={`webhook-status ${webhookStatus.hasWebhookSecret ? 'success' : 'warning'}`}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               {webhookStatus.hasWebhookSecret ? (
                 <>
                   <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                   <polyline points="22,4 12,14.01 9,11.01"></polyline>
                 </>
               ) : (
                 <>
                   <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                   <line x1="12" y1="9" x2="12" y2="13"></line>
                   <line x1="12" y1="17" x2="12.01" y2="17"></line>
                 </>
               )}
             </svg>
             <span>
               {webhookStatus.hasWebhookSecret 
                 ? 'Auto-Update Active' 
                 : 'Auto-Update Disabled - Missing Webhook Secret'
               }
             </span>
           </div>
         )}
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      {/* Filters and View Mode */}
      <div className="orders-controls">
        <select value={filterBy} onChange={e => setFilterBy(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Order Date</option>
          <option value="status">Payment Status</option>
          <option value="amount">Total Amount</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        <button onClick={() => setViewMode('table')}>Table</button>
        <button onClick={() => setViewMode('cards')}>Cards</button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : viewMode === 'table' ? renderTableView() : renderCardView()}

      {/* Update Payment Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Update Payment Status</h3>
            <p>Order ID: {selectedOrder._id.slice(-8)}</p>
            <p>Customer: {selectedOrder.customerName}</p>
            <p>Current Status: <span className={getPaymentStatusClass(selectedOrder.paymentStatus)}>{selectedOrder.paymentStatus}</span></p>
            <p>Total Amount: {formatCurrency(selectedOrder.totalAmount || selectedOrder.amount)}</p>

            <div className="status-buttons">
              {['paid', 'pending', 'failed', 'cancelled', 'refunded'].map(status => (
                <button
                  key={status}
                  className={status === selectedOrder.paymentStatus ? 'current' : ''}
                  onClick={() => handleUpdatePaymentStatus(selectedOrder._id, status)}
                  disabled={updateLoading}
                >
                  <span className={getPaymentStatusClass(status)}>{status}</span>
                </button>
              ))}
            </div>

            {updateLoading && <p>Updating payment status...</p>}
            <button onClick={() => setShowUpdateModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
