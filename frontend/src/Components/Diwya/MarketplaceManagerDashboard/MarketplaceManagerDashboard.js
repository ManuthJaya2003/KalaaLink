import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainNav from '../../MainNav/MainNav';
import ProductDetails from '../ProductDetails/ProductDetails';
import Product from '../Product/Product';
import './MarketplaceManagerDashboard.css';

function MarketplaceManagerDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [customizations, setCustomizations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // API URLs
  const CUSTOMIZATION_URL = 'http://localhost:5000/api/customizations';
  const DELIVERY_URL = 'http://localhost:5000/api/deliveries';
  const ORDER_URL = 'http://localhost:5000/api/orders';

  const handleSignOut = () => {
    // Clear any stored user data
    localStorage.removeItem("employee");
    localStorage.removeItem("user");
    localStorage.removeItem("artist");
    
    // Navigate to home page
    navigate("/mainhome");
  };

  const fetchCounts = async () => {
    try {
      const [customizationsRes, deliveriesRes, ordersRes] = await Promise.all([
        axios.get(CUSTOMIZATION_URL),
        axios.get(DELIVERY_URL),
        axios.get(ORDER_URL),
      ]);
      setCustomizations(customizationsRes.data);
      setDeliveries(deliveriesRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleCloseAddProductModal = () => {
    setShowAddProductModal(false);
  };

  const handleProductAdded = () => {
    setShowAddProductModal(false);
    // Refresh the product list in ProductDetails
    window.dispatchEvent(new CustomEvent('refreshProducts'));
  };

  return (
    <div className="marketplace-dashboard-page">
      <MainNav />
      
      {/* Dashboard Header */}
      <header className="marketplace-dashboard-header">
        <div className="marketplace-dashboard-header-container">
          <div className="marketplace-dashboard-header-left">
            <h1 className="marketplace-dashboard-header-title">Marketplace Manager Dashboard</h1>
            <p className="marketplace-dashboard-welcome-message">
              Welcome back! Manage your marketplace inventory, orders, and deliveries efficiently.
            </p>
          </div>
          <button className="marketplace-dashboard-signout-btn" onClick={handleSignOut}>
            <svg className="signout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>
      
      {/* Dashboard Navigation */}
      <nav className="marketplace-dashboard-nav">
        <div className="marketplace-dashboard-nav-container">
          <button 
            className={`marketplace-nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
            Products
          </button>
          <button 
            className={`marketplace-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Orders ({orders.length})
          </button>
          <button 
            className={`marketplace-nav-btn ${activeTab === 'deliveries' ? 'active' : ''}`}
            onClick={() => setActiveTab('deliveries')}
          >
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6"></path>
            </svg>
            Deliveries ({deliveries.length})
          </button>
          <button 
            className="marketplace-nav-btn marketplace-nav-btn-customize"
            onClick={() => navigate('/customizationdetails')}
          >
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
            Customizations ({customizations.length})
          </button>
          <button 
            className="marketplace-nav-btn marketplace-nav-btn-marketplace"
            onClick={() => navigate('/marketplace')}
          >
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            View Marketplace
          </button>
        </div>
      </nav>
      
      <main className="marketplace-dashboard-main">
        <div className="marketplace-dashboard-container">
          {/* Add Product Button - Only show on Products tab */}
          {activeTab === 'products' && (
            <div className="add-product-section">
              <button 
                className="add-product-btn"
                onClick={handleAddProduct}
              >
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Product
              </button>
            </div>
          )}
          
          <ProductDetails 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="marketplace-modal-overlay" onClick={handleCloseAddProductModal}>
          <div className="marketplace-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button 
                className="modal-close-btn"
                onClick={handleCloseAddProductModal}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <Product 
                isEditing={false}
                product={null}
                onSave={handleProductAdded}
                onCancel={handleCloseAddProductModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketplaceManagerDashboard;