import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainNav from '../../MainNav/MainNav';
import ProductDetails from '../ProductDetails/ProductDetails';
import Product from '../Product/Product';
import HomeTab from './HomeTab';
import AnalyticsTab from './AnalyticsTab';
import CustomizationsTab from './CustomizationsTab';
import './MarketplaceManagerDashboard.css';

function MarketplaceManagerDashboard() {
  const [activeTab, setActiveTab] = useState('home');
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

  // Listen for add product modal trigger from ProductDetails
  useEffect(() => {
    const handleOpenAddProductModal = () => {
      setShowAddProductModal(true);
    };
    
    window.addEventListener('openAddProductModal', handleOpenAddProductModal);
    return () => {
      window.removeEventListener('openAddProductModal', handleOpenAddProductModal);
    };
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
      {/* Fixed Sidebar */}
      <aside className="marketplace-dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Marketplace Manager</h1>
          <div className="sidebar-logo">
            <img src="/logo.png" alt="KalaaLink Logo" className="logo-icon" />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'deliveries' ? 'active' : ''}`}
            onClick={() => setActiveTab('deliveries')}
          >
            Deliveries ({deliveries.length})
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'customizations' ? 'active' : ''}`}
            onClick={() => setActiveTab('customizations')}
          >
            Customizations ({customizations.length})
          </button>
          <button 
            className="sidebar-btn signout-btn"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="marketplace-dashboard-main">
        <div className="marketplace-dashboard-content">
          <div className="marketplace-dashboard-container">
            {/* Tab Content */}
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'products' && (
              <ProductDetails 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'orders' && (
              <ProductDetails 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'deliveries' && (
              <ProductDetails 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'customizations' && (
              <CustomizationsTab customizations={customizations} />
            )}
          </div>
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