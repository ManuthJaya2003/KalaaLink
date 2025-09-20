import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainNav from '../../MainNav/MainNav';
import AuthFooter from '../../Common/AuthFooter';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleContinueShopping = () => {
    navigate('/marketplace');
  };

  const handleGenerateInvoice = () => {
    generateInvoicePDF();
  };

  const generateInvoicePDF = () => {
    // Create a new window with the invoice content
    const invoiceWindow = window.open('', '_blank', 'width=800,height=600');
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Invoice - ${order._id}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .invoice {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .invoice::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
          }
          .invoice-header {
            margin-bottom: 30px;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .invoice-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 20px;
          }
          .invoice-logo {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .invoice-logo img {
            height: 60px;
            width: auto;
            max-width: 200px;
            object-fit: contain;
          }
          .invoice-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
            text-align: left;
          }
          .invoice-detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .invoice-detail-row:last-child {
            border-bottom: none;
          }
          .invoice-detail-label {
            font-weight: 600;
            color: #495057;
            min-width: 120px;
          }
          .invoice-detail-value {
            color: #2c3e50;
            text-align: right;
            flex: 1;
          }
          .invoice-status {
            background: #28a745;
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            display: inline-block;
            margin: 20px 0;
          }
          .invoice-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .order-items {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
          }
          .order-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .order-item:last-child {
            border-bottom: none;
          }
          .item-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            overflow: hidden;
            margin-right: 15px;
          }
          .item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .item-details {
            flex: 1;
          }
          .item-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .item-price {
            color: #28a745;
            font-weight: 600;
          }
          @media print {
            body { background: white; }
            .invoice { box-shadow: none; border: 2px solid #333; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="invoice-header">
            <div class="invoice-logo">
              <img src="/logo.png" alt="KalaaLink Logo" />
            </div>
            <div class="invoice-title">ORDER INVOICE</div>
            <div class="invoice-subtitle">KalaaLink - Your Gateway to Art & Culture</div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Order ID:</span>
              <span class="invoice-detail-value">${order._id}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Customer:</span>
              <span class="invoice-detail-value">${order.customerName}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Email:</span>
              <span class="invoice-detail-value">${order.customerEmail}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Order Date:</span>
              <span class="invoice-detail-value">${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Payment Status:</span>
              <span class="invoice-detail-value">Paid</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Total Amount:</span>
              <span class="invoice-detail-value">LKR ${order.totalAmount}</span>
            </div>
          </div>

          <div class="order-items">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Order Items</h3>
            ${order.items && order.items.length > 0 ? order.items.map(item => `
              <div class="order-item">
                <div class="item-image">
                  <img src="${item.image || '/logo.png'}" alt="${item.artType || 'Artwork'}" />
                </div>
                <div class="item-details">
                  <div class="item-name">${item.artType || 'Artwork'}</div>
                  <div class="item-price">LKR ${item.price || '0.00'} x ${item.quantity || 1}</div>
                </div>
              </div>
            `).join('') : '<p>No items found</p>'}
          </div>

          <div class="invoice-status">Order Confirmed</div>
          
          <div class="invoice-footer">
            <p>Thank you for your purchase!</p>
            <p>For support, contact us at support@kalaalink.com</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };


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
    <>
      <MainNav />
      <div className="order-confirmation-container">
        <div className="success-card">
          <h1 className="success-title">Order Confirmed</h1>
          <p className="success-subtitle">
            Thank you for your purchase
          </p>

          <div className="order-details">
            <div style={{ marginBottom: '16px' }}>
              <img src="/logo.png" alt="KalaaLink Logo" style={{ height: '50px', width: 'auto', maxWidth: '150px' }} />
            </div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#2D3748' }}>Order Details</h3>
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
              <span className="value">Paid</span>
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
            <span className="delivery-status">{order.useDelivery ? 'Included' : 'Not requested'}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>LKR {order.totalAmount}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <button onClick={handleContinueShopping} className="btn btn-secondary">
            Continue Shopping
          </button>
          <button onClick={handleGenerateInvoice} className="btn btn-primary">
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
      <AuthFooter />
    </>
  );
};

export default OrderConfirmation;