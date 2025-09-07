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

  return (
    <div style={{ padding: '20px' }}>

      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      {/* Content Based on Active Tab */}
      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</p>
      ) : (
        <>
          {activeTab === 'products' && (
            <>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <div key={product._id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                    <Product
                      product={product}
                      onAdd={handleUpdateProducts}
                      isEditing={editingProduct?._id === product._id}
                      setEditing={setEditingProduct}
                      onAddToCart={handleAddToCart}
                      cart={cart}
                    />
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>No products found</p>
              )}
            </>
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