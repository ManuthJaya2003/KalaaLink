

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../CartContext/CartContext';
import ProductPopup from '../ProductPopup/ProductPopup';

const BASE_URL = 'http://localhost:5000/api/art';

// Fallback URLs in case the primary endpoint doesn't work
const FALLBACK_URLS = [
  'http://localhost:5000/api/products',
  'http://localhost:5000/api/arts'
];

const ProductCard = ({ product, onAddToCart }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }}>
      <img
        src={product.image}
        alt={product.artType}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: '8px',
          marginBottom: '16px'
        }}
        onError={(e) => {
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUI1Q0Y2Ii8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
        }}
      />
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        marginBottom: '8px',
        color: '#1f2937',
        fontFamily: 'Georgia, serif'
      }}>
        {product.artType}
      </h3>
      <p style={{ 
        margin: '4px 0', 
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <strong>Artist:</strong> {product.artistName}
      </p>
      <p style={{ 
        margin: '4px 0', 
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <strong>Size:</strong> {product.size}
      </p>
      <p style={{ 
        margin: '4px 0', 
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <strong>Frame:</strong> {product.frameSize}
      </p>
      <p style={{ 
        color: '#10b981', 
        fontWeight: 'bold',
        fontSize: '18px',
        margin: '12px 0'
      }}>
        LKR ${product.price}
      </p>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginTop: '16px' 
      }}>
        <button
          onClick={() => setIsPopupOpen(true)}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
        >
          View Details
        </button>
        <button
          onClick={() => onAddToCart(product)}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          Add to Cart
        </button>
      </div>

      {isPopupOpen && (
        <ProductPopup 
          product={product} 
          onClose={() => setIsPopupOpen(false)} 
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};

const CustomerDashboard = () => {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { setCart } = useCart();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching products from:', BASE_URL);
      
      // Simple test first
      const response = await axios.get(BASE_URL);
      console.log('API Response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Setting arts data:', response.data);
        console.log('Number of products:', response.data.length);
        setArts(response.data);
        console.log('Arts state updated with:', response.data.length, 'products');
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
        setArts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setError(`Failed to load products: ${err.response?.data?.message || err.message}`);
      setArts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('CustomerDashboard: Component mounted, fetching products...');
    fetchProducts();
  }, []);

  // Listen for refresh events from parent component
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing products...');
      fetchProducts();
    };
    
    window.addEventListener('refreshProducts', handleRefresh);
    return () => {
      window.removeEventListener('refreshProducts', handleRefresh);
    };
  }, []);

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`${product.artType} added to cart!`);
  };

  console.log('CustomerDashboard render - loading:', loading, 'error:', error, 'arts.length:', arts.length);

  return (
    <div style={{ padding: '20px' }}>
      {/* Debug Info */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        Debug: Loading: {loading.toString()}, Error: {error || 'none'}, Arts: {arts.length}
      </div>

      {/* Test Message */}
      <div style={{ 
        background: '#e0f2fe', 
        border: '1px solid #0288d1', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#01579b' }}>CustomerDashboard Component Loaded</h3>
        <p style={{ margin: '0 0 16px 0', color: '#0277bd' }}>This component is working. Check the debug info in the top-right corner.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={fetchProducts}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0288d1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Test API Call
          </button>
          <button 
            onClick={() => {
              console.log('Setting test data...');
              setArts([{
                _id: 'test1',
                artType: 'Test Painting',
                artistName: 'Test Artist',
                size: 'Large',
                frameSize: '14x10',
                price: 1000,
                image: 'https://via.placeholder.com/300x200?text=Test+Image'
              }]);
              setLoading(false);
              setError('');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Load Test Data
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          textAlign: 'center', 
          color: '#ef4444', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>{error}</p>
          <button 
            onClick={fetchProducts}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }}></div>
          <p style={{ color: '#6b7280', margin: '0' }}>Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && arts.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px', 
          padding: '10px' 
        }}>
          {arts.map(art => (
            <ProductCard key={art._id} product={art} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      {/* No Products Found */}
      {!loading && !error && arts.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#6b7280'
        }}>
          <svg 
            style={{ width: '64px', height: '64px', marginBottom: '16px', opacity: 0.5 }}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21,15 16,10 5,21"></polyline>
          </svg>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No products available</h3>
          <p style={{ margin: '0 0 16px 0' }}>Check back later for new artworks!</p>
          <button 
            onClick={fetchProducts}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;