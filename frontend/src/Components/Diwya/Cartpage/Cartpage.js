import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import MainNav from '../../MainNav/MainNav';
import MainFooter from '../../MainFooter/MainFooter';
import MapPicker from '../../Manuth/BookArtist/MapPicker';
import axios from 'axios';

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

    if (checkoutData.useDelivery && !checkoutData.deliveryAddress.address) {
      setError('Delivery address is required when delivery is selected');
      return;
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

  const handleDebugCart = () => {
    if (window.debugCart) {
      window.debugCart();
    } else {
      console.log('Debug function not available');
    }
  };

  // Safely handle undefined cart with default empty array
  const totalPrice = (cart || []).reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <MainNav />
      <main className="cart-main">
        <div className="cart-container">
          <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
            Shopping Cart
          </h1>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>Your cart is empty</p>
          <button
            onClick={handleDebugCart}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Debug Cart
          </button>
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
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{item.artType}</h3>
                <p><strong>Price:</strong> LKR {item.price} x {item.quantity} = LKR {(item.price * item.quantity).toFixed(2)}</p>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Artist:</strong> {item.artistName}</p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(item._id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
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
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Checkout
              </button>
              <button
                onClick={handleClearCart}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Cart
              </button>
              <button
                onClick={handleDebugCart}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Debug Cart
              </button>
            </div>
          </div>

          {/* Checkout Form Modal */}
          {showCheckoutForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{ margin: 0, color: '#1f2937' }}>Checkout Information</h2>
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCheckoutSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={checkoutData.customerName}
                      onChange={(e) => setCheckoutData({...checkoutData, customerName: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={checkoutData.customerEmail}
                      onChange={(e) => setCheckoutData({...checkoutData, customerEmail: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={checkoutData.customerPhone}
                      onChange={(e) => setCheckoutData({...checkoutData, customerPhone: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={checkoutData.useDelivery}
                        onChange={(e) => setCheckoutData({...checkoutData, useDelivery: e.target.checked})}
                      />
                      <span style={{ fontWeight: 'bold' }}>Request Delivery</span>
                    </label>
                  </div>

                  {checkoutData.useDelivery && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                      <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>Delivery Address</h3>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                          Address *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.deliveryAddress.address}
                          onChange={(e) => setCheckoutData({
                            ...checkoutData,
                            deliveryAddress: {...checkoutData.deliveryAddress, address: e.target.value}
                          })}
                          required={checkoutData.useDelivery}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                          City *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.deliveryAddress.city}
                          onChange={(e) => setCheckoutData({
                            ...checkoutData,
                            deliveryAddress: {...checkoutData.deliveryAddress, city: e.target.value}
                          })}
                          required={checkoutData.useDelivery}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                          District *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.deliveryAddress.district}
                          onChange={(e) => setCheckoutData({
                            ...checkoutData,
                            deliveryAddress: {...checkoutData.deliveryAddress, district: e.target.value}
                          })}
                          required={checkoutData.useDelivery}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.deliveryAddress.postalCode}
                          onChange={(e) => setCheckoutData({
                            ...checkoutData,
                            deliveryAddress: {...checkoutData.deliveryAddress, postalCode: e.target.value}
                          })}
                          required={checkoutData.useDelivery}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          value={checkoutData.deliveryAddress.contactNumber}
                          onChange={(e) => setCheckoutData({
                            ...checkoutData,
                            deliveryAddress: {...checkoutData.deliveryAddress, contactNumber: e.target.value}
                          })}
                          required={checkoutData.useDelivery}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      {/* Map Picker for Delivery Location */}
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                          📍 Delivery Location (Optional)
                        </label>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
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
                  )}

                  {error && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      color: '#dc2626',
                      marginBottom: '20px'
                    }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowCheckoutForm(false)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: isProcessing ? '#9ca3af' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {isProcessing ? 'Processing...' : `Pay LKR ${totalPrice.toFixed(2)}`}
                    </button>
                  </div>
                </form>
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