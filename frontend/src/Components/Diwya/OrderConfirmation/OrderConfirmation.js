import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleContinueShopping = () => {
    navigate('/marketplace');
  };

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  if (loading) {
    return (
      <div className="order-confirmation-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleContinueShopping} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-container">
        <div className="error-message">
          <h2>Order Not Found</h2>
          <p>The order you're looking for could not be found.</p>
          <button onClick={handleContinueShopping} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-header">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-message">
          Thank you for your purchase, {order.customerName}! Your order has been successfully placed.
        </p>
      </div>

      <div className="order-details">
        <div className="order-info">
          <h2>Order Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Order ID:</span>
              <span className="value">{order._id}</span>
            </div>
            <div className="info-item">
              <span className="label">Order Date:</span>
              <span className="value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="label">Payment Status:</span>
              <span 
                className="value status-badge"
                style={{ backgroundColor: getStatusColor(order.paymentStatus) }}
              >
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Total Amount:</span>
              <span className="value total-amount">LKR {order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="customer-info">
          <h2>Customer Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Name:</span>
              <span className="value">{order.customerName}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{order.customerEmail}</span>
            </div>
            {order.customerPhone && (
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{order.customerPhone}</span>
              </div>
            )}
          </div>
        </div>

        {order.useDelivery && order.deliveryAddress && (
          <div className="delivery-info">
            <h2>Delivery Information</h2>
            <div className="delivery-address">
              <p><strong>Address:</strong> {order.deliveryAddress.address}</p>
              <p><strong>City:</strong> {order.deliveryAddress.city}</p>
              <p><strong>District:</strong> {order.deliveryAddress.district}</p>
              <p><strong>Postal Code:</strong> {order.deliveryAddress.postalCode}</p>
              <p><strong>Contact:</strong> {order.deliveryAddress.contactNumber}</p>
            </div>
          </div>
        )}

        <div className="order-items">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.productImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUI1Q0Y2Ii8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'} 
                      alt={item.productName}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUI1Q0Y2Ii8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3>{item.productName}</h3>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                    <p className="item-price">LKR {item.price} each</p>
                    <p className="item-total">Total: LKR {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No items found in this order.</p>
            )}
          </div>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>LKR {order.totalAmount}</span>
          </div>
          <div className="summary-row">
            <span>Delivery:</span>
            <span>{order.useDelivery ? 'Included' : 'Not requested'}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>LKR {order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button onClick={handleContinueShopping} className="btn btn-secondary">
          Continue Shopping
        </button>
        <button onClick={handleViewOrders} className="btn btn-primary">
          View My Orders
        </button>
      </div>

      <div className="confirmation-footer">
        <p>
          A confirmation email has been sent to <strong>{order.customerEmail}</strong>
        </p>
        <p>
          If you have any questions about your order, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;