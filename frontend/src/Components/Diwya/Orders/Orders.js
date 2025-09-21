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
  const [clearLoading, setClearLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

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
        console.log('ℹ️ Webhook secret not configured - using alternative payment confirmation methods');
        console.log('📝 Note: Webhook is optional - payment confirmation works via session verification');
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

  // Separate useEffect for payment checking that doesn't depend on orders
  useEffect(() => {
    const checkPendingPayments = async () => {
      try {
        // Get fresh orders data
        const response = await axios.get(ORDER_URL);
        const currentOrders = response.data;
        const pendingOrders = currentOrders.filter(order => order.paymentStatus === 'pending');
        
        if (pendingOrders.length > 0) {
          console.log(`🔄 Checking ${pendingOrders.length} pending orders for payment updates...`);
          
          for (const order of pendingOrders) {
            if (order.stripeSessionId) {
              try {
                const confirmResponse = await axios.post(`${ORDER_URL}/confirm-payment`, {
                  orderId: order._id,
                  sessionId: order.stripeSessionId
                });
                
                if (confirmResponse.data.success) {
                  console.log(`✅ Order ${order._id} payment confirmed automatically`);
                  // Refresh orders after successful confirmation
                  await fetchOrders();
                }
              } catch (error) {
                // Silently continue with other orders
                console.log(`ℹ️ Order ${order._id} still pending`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking pending payments:', error);
      }
    };

    // Check pending payments every 30 seconds
    const paymentCheckInterval = setInterval(checkPendingPayments, 30000);
    
    return () => clearInterval(paymentCheckInterval);
  }, []); // Empty dependency array - only run once on mount

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

  const handleClearOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setClearLoading(true);
        await axios.delete(`${ORDER_URL}/${orderId}`);
        await fetchOrders();
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
      } finally {
        setClearLoading(false);
      }
    }
  };

  const handleBulkDeleteOrders = async () => {
    try {
      setBulkDeleteLoading(true);
      const response = await axios.delete(`${ORDER_URL}/bulk/${filterBy}`);
      await fetchOrders();
      alert(`Successfully deleted ${response.data.deletedCount} ${filterBy} orders!`);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error(`Error bulk deleting ${filterBy} orders:`, error);
      if (error.response?.status === 404) {
        alert(`No ${filterBy} orders found to delete.`);
      } else {
        alert(`Failed to delete ${filterBy} orders. Please try again.`);
      }
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const openBulkDeleteConfirm = () => {
    const ordersCount = filteredOrders.filter(order => order.paymentStatus === filterBy).length;
    if (ordersCount === 0) {
      alert(`No ${filterBy} orders found to delete.`);
      return;
    }
    setShowBulkDeleteConfirm(true);
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
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);
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
            <th>Clear</th>
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
                <button 
                  className="btn btn-clear-black"
                  onClick={() => handleClearOrder(order._id)}
                  disabled={clearLoading}
                >
                  Clear
                </button>
              </td>
              <td>
                <button 
                  className="btn btn-update"
                  onClick={() => openUpdateModal(order)}
                >
                  Update Status
                </button>
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
            <button 
              className="btn btn-clear-black"
              onClick={() => handleClearOrder(order._id)}
              disabled={clearLoading}
            >
              Clear
            </button>
            <button 
              className="btn btn-update"
              onClick={() => openUpdateModal(order)}
            >
              Update Status
            </button>
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
        <div className="orders-title-section">
          <h2>Orders Management</h2>
          <p>Manage and track all marketplace orders.</p>
        </div>
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
        <div className="header-actions">
          <button className="btn btn-refresh" onClick={handleRefresh}>Refresh</button>
        </div>
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
        {(filterBy === 'paid' || filterBy === 'pending') && (
          <button 
            className="btn btn-danger"
            onClick={openBulkDeleteConfirm}
            disabled={bulkDeleteLoading}
            style={{ 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '4px',
              cursor: bulkDeleteLoading ? 'not-allowed' : 'pointer',
              opacity: bulkDeleteLoading ? 0.6 : 1
            }}
          >
            {bulkDeleteLoading ? 'Clearing...' : `Clear All ${filterBy.charAt(0).toUpperCase() + filterBy.slice(1)} Orders`}
          </button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : viewMode === 'table' ? renderTableView() : renderCardView()}

      {/* Update Payment Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#000000' }}>Update Payment Status</h3>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-info">
                <p><strong>Order ID:</strong> {selectedOrder._id.slice(-8)}</p>
                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong>Current Status:</strong> <span className={getPaymentStatusClass(selectedOrder.paymentStatus)}>{selectedOrder.paymentStatus}</span></p>
                <p><strong>Total Amount:</strong> {formatCurrency(selectedOrder.totalAmount || selectedOrder.amount)}</p>
              </div>

              <div className="status-buttons">
                <h4>Select New Status:</h4>
                {['paid', 'pending', 'failed', 'cancelled', 'refunded'].map(status => (
                  <button
                    key={status}
                    className={`btn btn-status-${status} ${status === selectedOrder.paymentStatus ? 'current' : ''}`}
                    onClick={() => handleUpdatePaymentStatus(selectedOrder._id, status)}
                    disabled={updateLoading}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {updateLoading && <p className="loading-text">Updating payment status...</p>}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-cancel-black" onClick={() => setShowUpdateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#000000' }}>Confirm Bulk Delete</h3>
              <button className="modal-close" onClick={() => setShowBulkDeleteConfirm(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="bulk-delete-warning">
                <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '16px' }}>
                  ⚠️ WARNING: This action cannot be undone!
                </p>
                <p>
                  Are you sure you want to delete <strong>ALL</strong> {filterBy} orders? 
                  This will permanently remove {filteredOrders.filter(order => order.paymentStatus === filterBy).length} {filterBy} orders from the database.
                </p>
                <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '12px' }}>
                  This action will also delete any associated delivery records.
                </p>
              </div>

              {bulkDeleteLoading && <p className="loading-text">Deleting {filterBy} orders...</p>}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-cancel-black" 
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkDeleteLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleBulkDeleteOrders}
                disabled={bulkDeleteLoading}
                style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px',
                  marginLeft: '8px'
                }}
              >
                {bulkDeleteLoading ? 'Deleting...' : `Yes, Delete All ${filterBy.charAt(0).toUpperCase() + filterBy.slice(1)} Orders`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
