import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../CartContext/CartContext';
import MainNav from '../../MainNav/MainNav';
import MainFooter from '../../MainFooter/MainFooter';
import ProductPopup from '../ProductPopup/ProductPopup';
import CustomizationForm from '../CustomizationForm/CustomizationForm';
import ReviewModal from './ReviewModal';
import ReviewsModal from './ReviewsModal';
import './Marketplace.css';

const BASE_URL = 'http://localhost:5000/api/art';

const ProductCard = ({ product, onAddToCart, onViewDetails, onPostReview, onViewReviews, onBuyNow, reviews, averageRating, latestReview }) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  const handlePreviousReview = () => {
    if (reviews && reviews.length > 0) {
      setCurrentReviewIndex(prev => 
        prev === 0 ? reviews.length - 1 : prev - 1
      );
    }
  };

  const handleNextReview = () => {
    if (reviews && reviews.length > 0) {
      setCurrentReviewIndex(prev => 
        prev === reviews.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.artType}
          className="product-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUI1Q0Y2Ii8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
          }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.artType}</h3>
        <p className="product-artist"><strong>Artist:</strong> {product.artistName}</p>
        <p className="product-price">LKR {product.price}</p>
        
        {/* Reviews Section - Always show with proper content */}
        <div className="product-reviews-section">
          <div className="rating-display">
            <div className="stars">
              {renderStars(averageRating)}
            </div>
            <span className="rating-text">
              {averageRating.toFixed(1)} ({reviews ? reviews.length : 0} review{(reviews ? reviews.length : 0) !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="latest-review">
            <div className="review-navigation">
              {reviews && reviews.length > 1 && (
                <button 
                  className="review-nav-btn prev-btn"
                  onClick={handlePreviousReview}
                  title="Previous review"
                >
                  ‹
                </button>
              )}
              <div className="review-content">
                {reviews && reviews.length > 0 ? (
                  <>
                    <p className="review-snippet">
                      "{reviews[currentReviewIndex].comment.substring(0, 80)}
                      {reviews[currentReviewIndex].comment.length > 80 ? '...' : ''}"
                    </p>
                    <p className="review-author">- {reviews[currentReviewIndex].customerName}</p>
                  </>
                ) : (
                  <>
                    <p className="review-snippet">No reviews yet</p>
                    <p className="review-author">- Be the first to review</p>
                  </>
                )}
              </div>
              {reviews && reviews.length > 1 && (
                <button 
                  className="review-nav-btn next-btn"
                  onClick={handleNextReview}
                  title="Next review"
                >
                  ›
                </button>
              )}
            </div>
            {reviews && reviews.length > 1 && (
              <div className="review-indicators">
                <span className="review-counter">
                  {currentReviewIndex + 1} of {reviews.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="product-buttons">
        <div className="product-buttons-row">
          <button
            onClick={() => onBuyNow(product)}
            className="btn btn-primary"
          >
            Buy Now
          </button>
          <button
            onClick={() => onViewDetails(product)}
            className="btn btn-secondary"
          >
            View Details
          </button>
        </div>
        <div className="product-buttons-row">
          <button
            onClick={() => onAddToCart(product)}
            className="btn btn-secondary"
          >
            Add to Cart
          </button>
        </div>
        <div className="product-buttons-row">
          <button
            onClick={() => onPostReview(product)}
            className="btn btn-review"
          >
            Post a Review
          </button>
        </div>
      </div>

    </div>
  );
};

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: '',
    material: '',
    colorPalette: '',
    frameOption: '',
    style: ''
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [productReviews, setProductReviews] = useState({});
  const [productRatings, setProductRatings] = useState({});
  const [productLatestReviews, setProductLatestReviews] = useState({});

  const fetchProducts = async () => {
    try {
      setError('');
      console.log('Marketplace: Fetching products from:', BASE_URL);
      
      const response = await axios.get(BASE_URL);
      console.log('Marketplace: API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setFilteredProducts(response.data);
        console.log('Marketplace: Products loaded:', response.data.length);
      } else {
        setError('Invalid response format from server');
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error('Marketplace: Error fetching products:', err);
      setError(`Failed to load products: ${err.response?.data?.message || err.message}`);
      setProducts([]);
    }
  };

  // Filter products based on selected filters
  const applyFilters = (productsToFilter) => {
    return productsToFilter.filter(product => {
      // Price range filter
      if (filters.priceRange) {
        const price = product.price;
        switch (filters.priceRange) {
          case 'below-10000':
            if (price >= 10000) return false;
            break;
          case '10000-50000':
            if (price < 10000 || price > 50000) return false;
            break;
          case '50000-200000':
            if (price < 50000 || price > 200000) return false;
            break;
          case 'above-200000':
            if (price <= 200000) return false;
            break;
          default:
            break;
        }
      }

      // Material/Medium filter
      if (filters.material && product.artType && !product.artType.toLowerCase().includes(filters.material.toLowerCase())) {
        return false;
      }

      // Color palette filter
      if (filters.colorPalette && product.colorPalette) {
        const productColors = Array.isArray(product.colorPalette) 
          ? product.colorPalette 
          : product.colorPalette.split(',').map(c => c.trim());
        if (!productColors.some(color => color.toLowerCase().includes(filters.colorPalette.toLowerCase()))) {
          return false;
        }
      }

      // Frame option filter
      if (filters.frameOption) {
        const frameSize = product.frameSize ? product.frameSize.toLowerCase() : '';
        switch (filters.frameOption) {
          case 'framed':
            if (!frameSize.includes('frame') && !frameSize.includes('framed')) return false;
            break;
          case 'unframed':
            if (frameSize.includes('frame') || frameSize.includes('framed')) return false;
            break;
          case 'ready-to-hang':
            if (!frameSize.includes('ready') && !frameSize.includes('hang')) return false;
            break;
          default:
            break;
        }
      }

      // Style/Genre filter
      if (filters.style && product.artType && !product.artType.toLowerCase().includes(filters.style.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Apply filters to current products
    const filtered = applyFilters(products);
    setFilteredProducts(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priceRange: '',
      material: '',
      colorPalette: '',
      frameOption: '',
      style: ''
    });
    setFilteredProducts(products);
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

  // Fetch reviews for a product
  const fetchProductReviews = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/product/${productId}`);
      const reviews = response.data;
      
      setProductReviews(prev => ({
        ...prev,
        [productId]: reviews
      }));
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / reviews.length;
        
        setProductRatings(prev => ({
          ...prev,
          [productId]: avgRating
        }));
        
        setProductLatestReviews(prev => ({
          ...prev,
          [productId]: reviews[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Modal handlers
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsPopupOpen(true);
  };

  const handlePostReview = (product) => {
    setSelectedProduct(product);
    setIsReviewModalOpen(true);
    // Fetch reviews if not already loaded
    if (!productReviews[product._id]) {
      fetchProductReviews(product._id);
    }
  };

  const handleViewReviews = (product) => {
    setSelectedProduct(product);
    setIsReviewsModalOpen(true);
    // Fetch reviews if not already loaded
    if (!productReviews[product._id]) {
      fetchProductReviews(product._id);
    }
  };

  const handleBuyNow = async (product) => {
    // Buy Now handler for product cards
    try {
      // Prepare order data
      const orderData = {
        items: [{
          productId: product._id,
          quantity: 1
        }],
        customerName: 'Guest Customer',
        customerEmail: 'guest@example.com',
        customerPhone: '',
        deliveryAddress: null,
        useDelivery: false
      };

      console.log('Creating order with data:', orderData);

      // Create order and get Stripe checkout URL
      const response = await axios.post('http://localhost:5000/api/orders/marketplace', orderData);
      
      console.log('Order creation response:', response.data);
      
      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };


  const handleReviewSubmit = (newReview) => {
    if (selectedProduct) {
      const productId = selectedProduct._id;
      const updatedReviews = [newReview, ...(productReviews[productId] || [])];
      
      setProductReviews(prev => ({
        ...prev,
        [productId]: updatedReviews
      }));
      
      // Recalculate average rating
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / updatedReviews.length;
      
      setProductRatings(prev => ({
        ...prev,
        [productId]: avgRating
      }));
      
      // Update latest review
      setProductLatestReviews(prev => ({
        ...prev,
        [productId]: newReview
      }));
    }
  };

  // Add to cart handler for modals
  const handleAddToCart = (product) => {
    console.log('Adding product to cart:', product);
    // This will be handled by the cart context in the actual implementation
    alert(`${product.artType} added to cart!`);
  };

  return (
    <div className="marketplace-page">
      <MainNav />
      
      {/* Marketplace Hero Video Section */}
      <div className="marketplace-hero-video">
        <video
          className="marketplace-background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/marketplaceHeroVid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="marketplace-container">
        {/* Art Marketplace Text Section - Matching Events/Artists/Donations exactly */}
        <div className="marketplace-text-section">
          <h2 className="marketplace-title">Art Marketplace</h2>
          <p className="marketplace-subtitle">Discover unique artworks from talented artists around the world</p>
        </div>

      <main className="marketplace-main">
        <div className="marketplace-content">
          {/* Search and Filter Bar - Matching Events page styling */}
          {Array.isArray(products) && products.length > 0 && (
            <div className="search-filter-bar">
              <div className="search-filter-left">
                <div className="search-group">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="search-input"
                    value=""
                    onChange={() => {}}
                  />
                  <button className="search-button" onClick={() => {}}>
                    Search
                  </button>
                </div>
                <MarketplaceActionButtons />
              </div>

              <div className="search-filter-right">
                {/* Price Range Filter */}
                <div className="filter-group">
                  <select
                    id="price-filter"
                    className="filter-select"
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  >
                    <option value="">All Prices</option>
                    <option value="below-10000">Below 10,000</option>
                    <option value="10000-50000">10,000 – 50,000</option>
                    <option value="50000-200000">50,000 – 200,000</option>
                    <option value="above-200000">Above 200,000</option>
                  </select>
                </div>

                {/* Material/Medium Filter */}
                <div className="filter-group">
                  <select
                    id="material-filter"
                    className="filter-select"
                    value={filters.material}
                    onChange={(e) => handleFilterChange('material', e.target.value)}
                  >
                    <option value="">All Materials</option>
                    <option value="photography">Photography</option>
                    <option value="painting">Painting</option>
                    <option value="drawing">Drawing</option>
                    <option value="mixed media">Mixed Media</option>
                    <option value="digital">Digital Art</option>
                    <option value="sculpture">Sculpture</option>
                  </select>
                </div>

                {/* Color Palette Filter */}
                <div className="filter-group">
                  <select
                    id="color-filter"
                    className="filter-select"
                    value={filters.colorPalette}
                    onChange={(e) => handleFilterChange('colorPalette', e.target.value)}
                  >
                    <option value="">All Colors</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="brown">Brown</option>
                    <option value="pink">Pink</option>
                  </select>
                </div>

                {/* Frame Options Filter */}
                <div className="filter-group">
                  <select
                    id="frame-filter"
                    className="filter-select"
                    value={filters.frameOption}
                    onChange={(e) => handleFilterChange('frameOption', e.target.value)}
                  >
                    <option value="">All Frame Types</option>
                    <option value="framed">Framed</option>
                    <option value="unframed">Unframed</option>
                    <option value="ready-to-hang">Ready to Hang</option>
                  </select>
                </div>

                {/* Style/Genre Filter */}
                <div className="filter-group">
                  <select
                    id="style-filter"
                    className="filter-select"
                    value={filters.style}
                    onChange={(e) => handleFilterChange('style', e.target.value)}
                  >
                    <option value="">All Styles</option>
                    <option value="abstract">Abstract</option>
                    <option value="realism">Realism</option>
                    <option value="modern">Modern</option>
                    <option value="traditional">Traditional</option>
                    <option value="contemporary">Contemporary</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="impressionist">Impressionist</option>
                  </select>
                </div>

                <button
                  className="clear-btn"
                  onClick={clearFilters}
                  disabled={!filters.priceRange && !filters.material && !filters.colorPalette && !filters.frameOption && !filters.style}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          <MarketplaceContent 
            products={filteredProducts} 
            error={error} 
            onRetry={fetchProducts}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onViewDetails={handleViewDetails}
            onPostReview={handlePostReview}
            onViewReviews={handleViewReviews}
            onBuyNow={handleBuyNow}
            productReviews={productReviews}
            productRatings={productRatings}
            productLatestReviews={productLatestReviews}
          />
        </div>
      </main>
      </div>
      
      <MainFooter />
      
      {/* Modals */}
      {isPopupOpen && selectedProduct && (
        <ProductPopup 
          product={selectedProduct} 
          onClose={() => setIsPopupOpen(false)} 
          onAddToCart={handleAddToCart}
        />
      )}

      {isReviewModalOpen && selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmit={handleReviewSubmit}
        />
      )}

      {isReviewsModalOpen && selectedProduct && (
        <ReviewsModal
          product={selectedProduct}
          reviews={productReviews[selectedProduct._id] || []}
          onClose={() => setIsReviewsModalOpen(false)}
        />
      )}

    </div>
  );
}

const MarketplaceContent = ({ products, error, onRetry, filters, onFilterChange, onClearFilters, onViewDetails, onPostReview, onViewReviews, onBuyNow, productReviews, productRatings, productLatestReviews }) => {
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



  if (error) {
    return (
      <div className="marketplace-error">
        <p>{error}</p>
        <button onClick={onRetry} className="btn btn-primary">
          Try Again
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
      </div>
    );
  }

  return (
    <div className="marketplace-products">
      <div className="products-grid">
        {products.map(product => (
          <ProductCard 
            key={product._id} 
            product={product} 
            onAddToCart={handleAddToCart}
            onViewDetails={onViewDetails}
            onPostReview={onPostReview}
            onViewReviews={onViewReviews}
            onBuyNow={onBuyNow}
            reviews={productReviews[product._id] || []}
            averageRating={productRatings[product._id] || 0}
            latestReview={productLatestReviews[product._id] || null}
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