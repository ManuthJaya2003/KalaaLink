import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Product from '../Product/Product';
import Orders from '../Orders/Orders';
import Deliveries from '../Deliveries/Deliveries';
import { useCart } from '../CartContext/CartContext';

const PRODUCT_URL = 'http://localhost:5000/api/art';
const CUSTOMIZATION_URL = 'http://localhost:5000/api/customizations';
const DELIVERY_URL = 'http://localhost:5000/api/deliveries';
const ORDER_URL = 'http://localhost:5000/api/orders';

function ProductDetails({ activeTab, onTabChange }) {
  const [products, setProducts] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [productReviews, setProductReviews] = useState({});
  const navigate = useNavigate();
  const { cart, setCart } = useCart();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, customizationsRes, deliveriesRes, ordersRes] = await Promise.all([
        axios.get(PRODUCT_URL),
        axios.get(CUSTOMIZATION_URL),
        axios.get(DELIVERY_URL),
        axios.get(ORDER_URL),
      ]);
      setProducts(productsRes.data);
      setCustomizations(customizationsRes.data);
      setDeliveries(deliveriesRes.data);
      setOrders(ordersRes.data);
      setError('');
      
      // Fetch reviews for each product
      await fetchProductReviews(productsRes.data);
    } catch (err) {
      console.error('Error fetching data:', {
        message: err.message,
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(`Failed to fetch data from ${err.config?.url}: ${err.response?.status || 'No status'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductReviews = async (products) => {
    try {
      const reviewsPromises = products.map(async (product) => {
        try {
          const response = await axios.get(`http://localhost:5000/api/reviews/product/${product._id}`);
          return { productId: product._id, reviews: response.data };
        } catch (err) {
          console.error(`Error fetching reviews for product ${product._id}:`, err);
          return { productId: product._id, reviews: [] };
        }
      });
      
      const reviewsResults = await Promise.all(reviewsPromises);
      const reviewsMap = {};
      reviewsResults.forEach(({ productId, reviews }) => {
        reviewsMap[productId] = reviews;
      });
      setProductReviews(reviewsMap);
    } catch (err) {
      console.error('Error fetching product reviews:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for refresh events from parent component
  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };
    
    window.addEventListener('refreshProducts', handleRefresh);
    return () => {
      window.removeEventListener('refreshProducts', handleRefresh);
    };
  }, []);

  const handleUpdateProducts = () => {
    fetchData();
    setEditingProduct(null);
  };

  const handleViewCustomizationRequests = () => {
    navigate('/customizationdetails');
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`${product.artType} added to cart!`);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`${PRODUCT_URL}/${productId}`);
      setProducts(products.filter((product) => product._id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      alert('Failed to delete product');
    }
  };

  const handleDeleteReview = async (reviewId, productId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`);
        // Update the reviews state to remove the deleted review
        setProductReviews(prev => ({
          ...prev,
          [productId]: prev[productId].filter(review => review._id !== reviewId)
        }));
        alert('Review deleted successfully!');
      } catch (err) {
        console.error('Delete review failed:', err.response?.data || err.message);
        alert('Failed to delete review');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>

      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="marketplace-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="marketplace-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setEditingProduct(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <Product 
                product={editingProduct}
                isEditing={true}
                onAdd={handleUpdateProducts}
                setEditing={setEditingProduct}
                onAddToCart={handleAddToCart}
                cart={cart}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Based on Active Tab */}
      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</p>
      ) : (
        <>
          {activeTab === 'products' && (
            <div className="products-container">
              <div className="section-header">
                <div className="section-title-row">
                  <h1>Products</h1>
                  <button 
                    className="add-product-btn"
                    onClick={() => {
                      // Trigger the add product modal from parent
                      window.dispatchEvent(new CustomEvent('openAddProductModal'));
                    }}
                  >
                    Add New Product
                  </button>
                </div>
                <p className="section-subtitle">Manage your product inventory and track their performance</p>
              </div>
              <div className="products-grid">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <div key={product._id}>
                      <div className="product-card">
                      <div className="product-image-container">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.artType}
                            className="product-image"
                          />
                        ) : (
                          <div className="product-placeholder">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="product-content">
                        <h2 className="product-title">{product.artType}</h2>
                        <div className="product-details">
                          <div className="detail-item">
                            <span className="detail-label">Artist:</span>
                            <span className="detail-value">{product.artistName}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Size:</span>
                            <span className="detail-value">{product.size}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Frame:</span>
                            <span className="detail-value">{product.frameSize}</span>
                          </div>
                        </div>
                        <p className="product-description">
                          {Array.isArray(product.colorPalette) 
                            ? product.colorPalette.join(', ') 
                            : product.colorPalette}
                        </p>
                        <div className="product-pricing">
                          <div className="pricing-item">
                            <span className="pricing-label">Price:</span>
                            <span className="pricing-value">LKR {product.price}</span>
                          </div>
                          <div className="pricing-item">
                            <span className="pricing-label">Created:</span>
                            <span className="pricing-value">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="product-actions">
                          <div className="action-buttons">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="btn btn-primary action-btn edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this product?')) {
                                  handleDeleteProduct(product._id);
                                }
                              }}
                              className="btn btn-secondary action-btn delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="no-products">
                    <p>No products found</p>
                  </div>
                )}
              </div>

              {/* Single Customer Reviews Table for All Products - Outside Product Grid */}
              <div className="all-reviews-section">
                <h3 className="reviews-title">Customer Reviews</h3>
                {Object.keys(productReviews).length > 0 && Object.values(productReviews).some(reviews => reviews.length > 0) ? (
                  <div className="reviews-table-container">
                    <table className="reviews-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Rate</th>
                          <th>Comment</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(productReviews).map(([productId, reviews]) => 
                          reviews.map((review) => {
                            const product = products.find(p => p._id === productId);
                            return (
                              <tr key={review._id}>
                                <td className="product-name">{product?.artType || 'Unknown Product'}</td>
                                <td className="review-rating">
                                  <div className="rating-stars">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <span 
                                        key={i} 
                                        className={`star ${i < review.rating ? 'filled' : 'empty'}`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="review-comment">{review.comment}</td>
                                <td className="review-actions">
                                  <button
                                    onClick={() => handleDeleteReview(review._id, productId)}
                                    className="btn btn-secondary review-delete-btn"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-reviews">No reviews yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deliveries' && (
            <Deliveries />
          )}

          {activeTab === 'orders' && (
            <Orders />
          )}
        </>
      )}
    </div>
  );
}

export default ProductDetails;