import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../CartContext/CartContext';
import MainNav from '../../MainNav/MainNav';
import MainFooter from '../../MainFooter/MainFooter';
import ProductPopup from '../ProductPopup/ProductPopup';
import CustomizationForm from '../CustomizationForm/CustomizationForm';
import './Marketplace.css';

const BASE_URL = 'http://localhost:5000/api/art';

const ProductCard = ({ product, onAddToCart }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.artType}
        className="product-image"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUI1Q0Y2Ii8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
        }}
      />
      <div className="product-info">
        <h3 className="product-title">{product.artType}</h3>
        <p className="product-artist"><strong>Artist:</strong> {product.artistName}</p>
        <p className="product-size"><strong>Size:</strong> {product.size}</p>
        <p className="product-frame"><strong>Frame:</strong> {product.frameSize}</p>
        <p className="product-price">LKR {product.price}</p>
      </div>
      <div className="product-actions">
        <button
          onClick={() => setIsPopupOpen(true)}
          className="btn btn-primary"
        >
          View Details
        </button>
        <button
          onClick={() => onAddToCart(product)}
          className="btn btn-success"
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

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Marketplace: Fetching products from:', BASE_URL);
      
      const response = await axios.get(BASE_URL);
      console.log('Marketplace: API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        console.log('Marketplace: Products loaded:', response.data.length);
      } else {
        setError('Invalid response format from server');
        setProducts([]);
      }
    } catch (err) {
      console.error('Marketplace: Error fetching products:', err);
      setError(`Failed to load products: ${err.response?.data?.message || err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Marketplace: Component mounted, fetching products...');
    fetchProducts();
  }, []);

  useEffect(() => {
    // Listen for refresh events from the manager dashboard
    const handleRefresh = () => {
      console.log('Marketplace: Refreshing products...');
      fetchProducts();
    };
    
    window.addEventListener('refreshProducts', handleRefresh);
    return () => {
      window.removeEventListener('refreshProducts', handleRefresh);
    };
  }, []);

  return (
    <div className="marketplace-page">
      <MainNav />
      
      <main className="marketplace-main">
        <div className="marketplace-container">
          <header className="marketplace-header">
            <h1 className="marketplace-title">Art Marketplace</h1>
            <p className="marketplace-subtitle">
              Discover unique artworks from talented artists around the world
            </p>
            <MarketplaceActionButtons />
          </header>
          
          <MarketplaceContent 
            products={products}
            loading={loading}
            error={error}
            onRetry={fetchProducts}
          />
        </div>
      </main>
      
      <MainFooter />
    </div>
  );
}

const MarketplaceContent = ({ products, loading, error, onRetry }) => {
  const { setCart } = useCart();

  const handleAddToCart = (product) => {
    console.log('Adding product to cart:', product);
    setCart(prev => {
      console.log('Previous cart state:', prev);
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        const updatedCart = prev.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        console.log('Updated cart (existing item):', updatedCart);
        return updatedCart;
      }
      const newCart = [...prev, { ...product, quantity: 1 }];
      console.log('Updated cart (new item):', newCart);
      return newCart;
    });
    alert(`${product.artType} added to cart!`);
  };

  const handleTestAddToCart = () => {
    const testProduct = {
      _id: 'test-product-123',
      artType: 'Test Painting',
      artistName: 'Test Artist',
      size: 'Medium',
      frameSize: '12x8',
      price: 299,
      image: 'https://via.placeholder.com/300x200?text=Test+Image'
    };
    handleAddToCart(testProduct);
  };

  const handleDebugCart = () => {
    if (window.debugCart) {
      window.debugCart();
    } else {
      console.log('Debug function not available');
    }
  };

  if (loading) {
    return (
      <div className="marketplace-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button onClick={handleTestAddToCart} className="btn btn-primary">
            Test Add to Cart
          </button>
          <button onClick={handleDebugCart} className="btn btn-success">
            Debug Cart
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-error">
        <p>{error}</p>
        <button onClick={onRetry} className="btn btn-primary">
          Try Again
        </button>
        <button onClick={handleTestAddToCart} className="btn btn-success" style={{ marginLeft: '10px' }}>
          Test Add to Cart
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="marketplace-empty">
        <h3>No products available</h3>
        <p>Check back later for new artworks!</p>
        <button onClick={onRetry} className="btn btn-primary">
          Refresh
        </button>
        <button onClick={handleTestAddToCart} className="btn btn-success" style={{ marginLeft: '10px' }}>
          Test Add to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="marketplace-products">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={handleTestAddToCart} className="btn btn-success">
            Test Add to Cart
          </button>
          <button onClick={handleDebugCart} className="btn btn-primary">
            Debug Cart
          </button>
        </div>
      </div>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard 
            key={product._id} 
            product={product} 
            onAddToCart={handleAddToCart} 
          />
        ))}
      </div>
    </div>
  );
};

function MarketplaceActionButtons() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleViewCart = () => navigate('/cart');
  
  const handleOpenCustomizationModal = () => {
    setShowCustomizationModal(true);
  };

  const handleCloseCustomizationModal = () => {
    setShowCustomizationModal(false);
  };

  const handleCustomizationSuccess = () => {
    setShowCustomizationModal(false);
    setShowSuccessMessage(true);
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <>
      <div className="marketplace-action-buttons">
        <button
          onClick={handleViewCart}
          className="marketplace-btn marketplace-btn-cart"
        >
          <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          View Cart ({cart.length})
        </button>
        <button
          onClick={handleOpenCustomizationModal}
          className="marketplace-btn marketplace-btn-customize"
        >
          <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
          Request Customization
        </button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="marketplace-success-message">
          <div className="success-content">
            <svg className="success-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            <span>Customization request submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomizationModal && (
        <div className="marketplace-modal-overlay" onClick={handleCloseCustomizationModal}>
          <div className="marketplace-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Customization</h2>
              <button 
                className="modal-close-btn"
                onClick={handleCloseCustomizationModal}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <CustomizationForm 
                onSave={handleCustomizationSuccess}
                onCancel={handleCloseCustomizationModal}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Marketplace;