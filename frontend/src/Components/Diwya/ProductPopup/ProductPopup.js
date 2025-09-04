import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductPopup = ({ product, onClose, onAddToCart }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    customerName: '',
    rating: 1,
    comment: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    customerName: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    contactNumber: '',
    deliveryStatus: 'Pending'
  });
  const [useDelivery, setUseDelivery] = useState(false);
  const navigate = useNavigate();

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Lock body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/reviews/product/${product._id}`);
      setReviews(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  }, [product?._id]);

  useEffect(() => {
    if (product?._id) {
      fetchReviews();
    }
  }, [product?._id, fetchReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/api/reviews', {
        productId: product._id,
        ...newReview
      });
      setReviews([response.data, ...reviews]);
      setNewReview({ customerName: '', rating: 1, comment: '' });
      setError('');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Check if delivery form is required and not filled
      if (useDelivery && (!deliveryDetails.customerName || !deliveryDetails.address)) {
        setError('Please fill in the delivery form before proceeding');
        setIsLoading(false);
        return;
      }

      // Prepare order data
      const orderData = {
        items: [{
          productId: product._id,
          quantity: 1
        }],
        customerName: deliveryDetails.customerName || 'Guest Customer',
        customerEmail: deliveryDetails.customerName ? 
          `${deliveryDetails.customerName.toLowerCase().replace(/\s+/g, '')}@example.com` : 
          'guest@example.com',
        customerPhone: deliveryDetails.contactNumber || '',
        deliveryAddress: useDelivery ? {
          address: deliveryDetails.address,
          city: deliveryDetails.city,
          district: deliveryDetails.district,
          postalCode: deliveryDetails.postalCode,
          contactNumber: deliveryDetails.contactNumber
        } : null,
        useDelivery: useDelivery
      };

      console.log('Creating order with data:', orderData);

      // Create order and get Stripe checkout URL
      const response = await axios.post('http://localhost:5000/api/orders/marketplace', orderData);
      
      console.log('Order creation response:', response.data);
      
      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to process order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const deliveryData = {
        artId: product._id,
        ...deliveryDetails,
      };
      await axios.post('http://localhost:5000/api/deliveries', deliveryData);
      setError('');
      // Redirect to payment page with product ID and quantity
      navigate(`/payment?productId=${product._id}&quantity=1&deliveryId=${deliveryDetails.customerName}`); // Use customerName as a temp identifier; consider generating a unique deliveryId if needed
    } catch (err) {
      setError('Failed to submit delivery details');
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @media (max-width: 768px) {
            .modal-content {
              width: 95% !important;
              max-height: 95vh !important;
              margin: 20px !important;
            }
          }
          
          @media (max-width: 480px) {
            .modal-content {
              width: 100% !important;
              height: 100% !important;
              max-height: 100vh !important;
              border-radius: 0 !important;
              margin: 0 !important;
            }
          }
        `}
      </style>
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: '#fff',
          padding: '0',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease-out',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px 0 24px',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '0',
            color: '#1f2937',
            fontFamily: 'Georgia, serif'
          }}>
            {product.artType}
          </h2>
          <button 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#6b7280';
            }}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '0 24px 24px 24px' }}>
        <img
          src={product.image}
          alt={product.artType}
          style={{ 
            maxWidth: '100%', 
            height: '200px', 
            objectFit: 'cover', 
            borderRadius: '8px', 
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUI1Q0Y2Ii8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
          }}
        />
        <p style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}><strong style={{ color: '#1f2937' }}>Size:</strong> {product.size}</p>
        <p style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}><strong style={{ color: '#1f2937' }}>Artist Name:</strong> {product.artistName}</p>
        <p style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}><strong style={{ color: '#1f2937' }}>Frame Size:</strong> {product.frameSize}</p>
        <p style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}><strong style={{ color: '#1f2937' }}>Color Palette:</strong> {Array.isArray(product.colorPalette) ? product.colorPalette.join(', ') : product.colorPalette}</p>
        <p style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.5' }}><strong style={{ color: '#1f2937' }}>Price:</strong> ${product.price}</p>
        <p style={{ marginBottom: '20px', color: '#374151', lineHeight: '1.5' }}><strong style={{ color: '#1f2937' }}>Created At:</strong> {new Date(product.createdAt).toLocaleString('en-US', {
          timeZone: 'Asia/Colombo',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}</p>

        {!showDeliveryForm && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6b7280';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? 'Processing...' : 'Buy Now'}
            </button>
            <button
              onClick={() => onAddToCart(product)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Add to Cart
            </button>
          </div>
        )}

        {showDeliveryForm && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Delivery Details</h3>
            <form onSubmit={handleDeliverySubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Use Delivery:</label>
                <input
                  type="checkbox"
                  checked={useDelivery}
                  onChange={(e) => setUseDelivery(e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                <span>Request Delivery</span>
              </div>
              {useDelivery && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Customer Name:</label>
                    <input
                      type="text"
                      value={deliveryDetails.customerName}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, customerName: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Address:</label>
                    <input
                      type="text"
                      value={deliveryDetails.address}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>City:</label>
                    <input
                      type="text"
                      value={deliveryDetails.city}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>District:</label>
                    <input
                      type="text"
                      value={deliveryDetails.district}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, district: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Postal Code:</label>
                    <input
                      type="text"
                      value={deliveryDetails.postalCode}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, postalCode: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Contact Number:</label>
                    <input
                      type="text"
                      value={deliveryDetails.contactNumber}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, contactNumber: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeliveryForm(false);
                    setUseDelivery(false);
                    setDeliveryDetails({
                      customerName: '',
                      address: '',
                      city: '',
                      district: '',
                      postalCode: '',
                      contactNumber: '',
                      deliveryStatus: 'Pending'
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (useDelivery && !deliveryDetails.customerName)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isLoading || (useDelivery && !deliveryDetails.customerName) ? '#9ca3af' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading || (useDelivery && !deliveryDetails.customerName) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Submitting...' : 'Proceed to Payment'}
                </button>
              </div>
              {error && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
            </form>
          </div>
        )}

        {/* Review Form */}
        {!showDeliveryForm && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Add a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Name:</label>
                <input
                  type="text"
                  value={newReview.customerName}
                  onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: showSuccessMessage ? 'block' : 'none', color: '#16a34a', marginBottom: '15px' }}>
                Review Submitted Successfully!
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rating:</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Comment:</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              {error && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
            </form>
          </div>
        )}

        {/* Reviews Display */}
        {!showDeliveryForm && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Customer Reviews</h3>
            {isLoading ? (
              <p>Loading reviews...</p>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} style={{
                  border: '1px solid #e5e7eb',
                  padding: '15px',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: 'bold' }}>{review.customerName} ({review.rating} Stars)</p>
                  <p>{review.comment}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>
                    {new Date(review.createdAt).toLocaleString('en-US', {
                      timeZone: 'Asia/Colombo',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p>No reviews yet</p>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ProductPopup;