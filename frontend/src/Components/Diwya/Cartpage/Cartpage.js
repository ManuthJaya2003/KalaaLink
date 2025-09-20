import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import MainNav from '../../MainNav/MainNav';
import MainFooter from '../../MainFooter/MainFooter';
import MapPicker from '../../Manuth/BookArtist/MapPicker';
import axios from 'axios';
import './Cartpage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, setCart, clearCart } = useCart(); // Use cart context
  
  // Checkout form state
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    useDelivery: false,
    deliveryAddress: {
      address: '',
      city: '',
      district: '',
      postalCode: '',
      contactNumber: ''
    }
  });
  const [deliveryCoordinates, setDeliveryCoordinates] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  console.log('CartPage - Current cart state:', cart);
  console.log('CartPage - Cart length:', cart?.length || 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkoutData.customerName || !checkoutData.customerEmail) {
      setError('Customer name and email are required');
      return;
    }

    if (checkoutData.useDelivery) {
      const { address, city, district, contactNumber } = checkoutData.deliveryAddress;
      if (!address || !city || !district || !contactNumber) {
        setError('All delivery fields (address, city, district, contact number) are required when delivery is selected');
        return;
      }
    }

    try {
      setIsProcessing(true);
      setError('');

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        customerPhone: checkoutData.customerPhone,
        deliveryAddress: checkoutData.useDelivery ? {
          ...checkoutData.deliveryAddress,
          coordinates: deliveryCoordinates
        } : null,
        useDelivery: checkoutData.useDelivery
      };

      // Create order and get Stripe checkout URL
      const response = await axios.post('http://localhost:5000/api/orders/marketplace', orderData);
      
      if (response.data.url) {
        // Clear cart before redirecting
        clearCart();
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
      clearCart();
    }
  };


  // Safely handle undefined cart with default empty array
  const totalPrice = (cart || []).reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <MainNav />
      <main className="cart-main" style={{ paddingTop: '100px' }}>
        <div className="cart-container">
          <div className="cart-header">
            <h1 className="cart-title">
              Shopping Cart
            </h1>
            <p className="cart-subtitle">Find all your goodies here</p>
          </div>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>Your cart is empty</p>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item._id}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                borderRadius: '8px',
                maxWidth: '600px',
                margin: '0 auto 15px',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 className="cart-product-name">{item.artType}</h3>
                <p><strong>Price:</strong> LKR {item.price} x {item.quantity} = LKR {(item.price * item.quantity).toFixed(2)}</p>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Artist:</strong> {item.artistName}</p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item._id)}
                className="cart-remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Total: LKR {totalPrice.toFixed(2)}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              <button
                onClick={handleCheckout}
                className="cart-checkout-btn"
              >
                Checkout
              </button>
              <button
                onClick={handleClearCart}
                className="cart-clear-btn"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Checkout Form Modal */}
          {showCheckoutForm && (
            <div className="checkout-modal-overlay">
              <div className={`checkout-modal-content ${checkoutData.useDelivery ? 'expanded' : ''}`}>
                <div className="checkout-modal-header">
                  <h2>Checkout Information</h2>
                  <button
                    className="checkout-modal-close"
                    onClick={() => setShowCheckoutForm(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="checkout-modal-body">
                  <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                    <div className={`form-columns ${checkoutData.useDelivery ? 'expanded' : ''}`}>
                      <div className={`form-column customer-info ${checkoutData.useDelivery ? 'expanded' : ''}`}>
                        <h3>Customer Information</h3>
                        <div className="form-group">
                          <label htmlFor="customerName">Customer Name *</label>
                          <input
                            type="text"
                            id="customerName"
                            value={checkoutData.customerName}
                            onChange={(e) => setCheckoutData({...checkoutData, customerName: e.target.value})}
                            required
                            placeholder="Enter your name"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="customerEmail">Email Address *</label>
                          <input
                            type="email"
                            id="customerEmail"
                            value={checkoutData.customerEmail}
                            onChange={(e) => setCheckoutData({...checkoutData, customerEmail: e.target.value})}
                            required
                            placeholder="Enter your email"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="customerPhone">Phone Number</label>
                          <input
                            type="tel"
                            id="customerPhone"
                            value={checkoutData.customerPhone}
                            onChange={(e) => setCheckoutData({...checkoutData, customerPhone: e.target.value})}
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div className="form-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={checkoutData.useDelivery}
                              onChange={(e) => setCheckoutData({...checkoutData, useDelivery: e.target.checked})}
                            />
                            <span className="checkbox-text">Request Delivery</span>
                          </label>
                        </div>
                      </div>

                      {checkoutData.useDelivery && (
                        <>
                          <div className="form-column delivery-form expanded">
                            <h3>Delivery Details</h3>
                        
                            <div className="form-group">
                              <label htmlFor="deliveryAddress">Address *</label>
                              <input
                                type="text"
                                id="deliveryAddress"
                                value={checkoutData.deliveryAddress.address}
                                onChange={(e) => setCheckoutData({
                                  ...checkoutData,
                                  deliveryAddress: {...checkoutData.deliveryAddress, address: e.target.value}
                                })}
                                required={checkoutData.useDelivery}
                                placeholder="Enter delivery address"
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor="deliveryCity">City *</label>
                              <input
                                type="text"
                                id="deliveryCity"
                                value={checkoutData.deliveryAddress.city}
                                onChange={(e) => setCheckoutData({
                                  ...checkoutData,
                                  deliveryAddress: {...checkoutData.deliveryAddress, city: e.target.value}
                                })}
                                required={checkoutData.useDelivery}
                                placeholder="Enter city"
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor="deliveryDistrict">District *</label>
                              <input
                                type="text"
                                id="deliveryDistrict"
                                value={checkoutData.deliveryAddress.district}
                                onChange={(e) => setCheckoutData({
                                  ...checkoutData,
                                  deliveryAddress: {...checkoutData.deliveryAddress, district: e.target.value}
                                })}
                                required={checkoutData.useDelivery}
                                placeholder="Enter district"
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor="deliveryPostalCode">Postal Code *</label>
                              <input
                                type="text"
                                id="deliveryPostalCode"
                                value={checkoutData.deliveryAddress.postalCode}
                                onChange={(e) => setCheckoutData({
                                  ...checkoutData,
                                  deliveryAddress: {...checkoutData.deliveryAddress, postalCode: e.target.value}
                                })}
                                required={checkoutData.useDelivery}
                                placeholder="Enter postal code"
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor="deliveryContactNumber">Contact Number *</label>
                              <input
                                type="tel"
                                id="deliveryContactNumber"
                                value={checkoutData.deliveryAddress.contactNumber}
                                onChange={(e) => setCheckoutData({
                                  ...checkoutData,
                                  deliveryAddress: {...checkoutData.deliveryAddress, contactNumber: e.target.value}
                                })}
                                required={checkoutData.useDelivery}
                                placeholder="Enter contact number"
                              />
                            </div>
                          </div>

                          <div className="form-column delivery-location expanded">
                            <h3>Delivery Location</h3>
                            <div className="form-group">
                              <label>📍 Delivery Location (Optional)</label>
                              <p className="map-description">
                                Click on the map to set the exact delivery location for better navigation
                              </p>
                              <MapPicker
                                selectedLocation={deliveryCoordinates}
                                onLocationSelect={setDeliveryCoordinates}
                                onAddressChange={(address) => {
                                  // Auto-fill address fields if possible
                                  if (address && !checkoutData.deliveryAddress.address) {
                                    setCheckoutData({
                                      ...checkoutData,
                                      deliveryAddress: {
                                        ...checkoutData.deliveryAddress,
                                        address: address
                                      }
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {error && (
                      <div className="error-message">
                        {error}
                      </div>
                    )}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCheckoutForm(false)}
                        disabled={isProcessing}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : `Pay LKR ${totalPrice.toFixed(2)}`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
        </div>
      </main>
      <MainFooter />
    </div>
  );
};

export default CartPage;