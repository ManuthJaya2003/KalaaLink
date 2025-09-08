import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Payment = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);
  const productId = queryParams.get('productId');
  const quantity = queryParams.get('quantity');
  const deliveryId = queryParams.get('deliveryId');

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Calculate amount based on product price (mocked here; replace with API call or context)
    if (productId && quantity) {
      // Mock price; in a real app, fetch the price from the product API
      const mockPrice = 100; // Replace with dynamic price (e.g., from product data)
      setPaymentDetails((prev) => ({
        ...prev,
        amount: (mockPrice * quantity).toFixed(2),
      }));
    }
  }, [productId, quantity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.amount) {
      setError('All fields are required');
      return;
    }
    if (!/^\d{16}$/.test(paymentDetails.cardNumber)) {
      setError('Card number must be 16 digits');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiryDate)) {
      setError('Expiry date must be MM/YY format (e.g., 12/25)');
      return;
    }
    if (!/^\d{3}$/.test(paymentDetails.cvv)) {
      setError('CVV must be 3 digits');
      return;
    }

    try {
      setIsLoading(true);
      // Simulate payment processing (replace with real payment gateway API call)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock 2-second delay
      setError('');
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/order-confirmation', { state: { productId, quantity, deliveryId } }); // Redirect to confirmation
      }, 2000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Payment Details</h2>
        <p><strong>Product ID:</strong> {productId || 'Not provided'}</p>
        <p><strong>Quantity:</strong> {quantity || '1'}</p>
        <p><strong>Delivery ID:</strong> {deliveryId || 'Not provided'}</p>
        <p><strong>Amount:</strong> LKR {paymentDetails.amount || '0.00'}</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Card Number:</label>
            <input
              type="text"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handleInputChange}
              placeholder="Enter 16-digit card number"
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Expiry Date:</label>
            <input
              type="text"
              name="expiryDate"
              value={paymentDetails.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY (e.g., 12/25)"
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>CVV:</label>
            <input
              type="text"
              name="cvv"
              value={paymentDetails.cvv}
              onChange={handleInputChange}
              placeholder="Enter 3-digit CVV"
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)} // Go back to previous page
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
          {error && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
          {showSuccessMessage && <p style={{ color: '#16a34a', marginTop: '10px' }}>Payment Successful! Redirecting...</p>}
        </form>
      </div>
    </div>
  );
};

export default Payment;