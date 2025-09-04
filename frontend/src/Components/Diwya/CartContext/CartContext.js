import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Helper functions for localStorage
const getCartFromStorage = () => {
  try {
    const cartData = localStorage.getItem('kalaalink-cart');
    if (!cartData) return [];
    
    const parsedCart = JSON.parse(cartData);
    
    // Validate cart data structure
    if (!Array.isArray(parsedCart)) {
      console.warn('Invalid cart data in localStorage, resetting to empty array');
      return [];
    }
    
    // Validate each cart item has required fields
    const validCart = parsedCart.filter(item => 
      item && 
      typeof item === 'object' && 
      item._id && 
      item.artType && 
      item.price && 
      item.quantity
    );
    
    if (validCart.length !== parsedCart.length) {
      console.warn('Some cart items were invalid and removed');
    }
    
    return validCart;
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('kalaalink-cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const clearCartFromStorage = () => {
  try {
    localStorage.removeItem('kalaalink-cart');
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error);
  }
};

export const CartProvider = ({ children }) => {
  // Initialize cart with localStorage data to prevent empty state on first render
  const [cart, setCart] = useState(() => {
    const savedCart = getCartFromStorage();
    console.log('CartProvider - Initializing cart with localStorage data:', savedCart);
    return savedCart;
  });

  // Load cart from localStorage on component mount (backup for SSR scenarios)
  useEffect(() => {
    const savedCart = getCartFromStorage();
    console.log('CartProvider - Loading cart from localStorage on mount:', savedCart);
    setCart(savedCart);
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    console.log('CartProvider - Cart state changed, saving to localStorage:', cart);
    saveCartToStorage(cart);
  }, [cart]);

  // Enhanced setCart function that also handles clearing
  const setCartWithPersistence = (newCart) => {
    if (Array.isArray(newCart) && newCart.length === 0) {
      // If cart is being cleared, also clear from localStorage
      clearCartFromStorage();
    }
    setCart(newCart);
  };

  // Function to completely clear the cart
  const clearCart = () => {
    setCart([]);
    clearCartFromStorage();
  };

  // Debug function to check localStorage state
  const debugCart = () => {
    const stored = localStorage.getItem('kalaalink-cart');
    console.log('Debug - localStorage cart data:', stored);
    console.log('Debug - Parsed cart data:', stored ? JSON.parse(stored) : null);
    console.log('Debug - Current cart state:', cart);
  };

  // Expose debug function in development
  if (process.env.NODE_ENV === 'development') {
    window.debugCart = debugCart;
  }

  console.log('CartProvider - Cart state:', cart);

  return (
    <CartContext.Provider value={{ cart, setCart: setCartWithPersistence, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('useCart must be used within a CartProvider');
    return { cart: [], setCart: () => {}, clearCart: () => {} };
  }
  return context;
};