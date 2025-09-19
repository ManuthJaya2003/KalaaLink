import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ProductPopup = ({ product, onClose }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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




  if (!product) return null;

  return createPortal(
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
        {/* Modal Header - With close button */}
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
              width: '30px',
              height: '30px',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '20px',
              fontWeight: 'bold',
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
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '350px',
              height: '280px',
              marginBottom: '20px',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f8f9fa'
            }}>
              <img
                src={product.image}
                alt={product.artType}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUI1Q0Y2Ii8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                }}
              />
            </div>
            
            <div style={{
              width: '100%',
              maxWidth: '500px',
              textAlign: 'left'
            }}>
              <p style={{ marginBottom: '8px', color: '#374151', lineHeight: '1.5', fontSize: '18px' }}>
                <span style={{ color: '#C1A37F', fontWeight: '600' }}>Artist:</span> {product.artistName}
              </p>
              <p style={{ marginBottom: '16px', color: '#374151', lineHeight: '1.5', fontSize: '18px' }}>
                <span style={{ color: '#C1A37F', fontWeight: '600' }}>Price:</span> LKR {product.price}
              </p>
              <p style={{ marginBottom: '8px', color: '#374151', lineHeight: '1.5', fontSize: '18px' }}>
                <span style={{ color: '#C1A37F', fontWeight: '600' }}>Frame:</span> {product.frameSize}
              </p>
              <p style={{ marginBottom: '8px', color: '#374151', lineHeight: '1.5', fontSize: '18px' }}>
                <span style={{ color: '#C1A37F', fontWeight: '600' }}>Size:</span> {product.size}
              </p>
              <p style={{ marginBottom: '8px', color: '#374151', lineHeight: '1.5', fontSize: '18px' }}>
                <span style={{ color: '#C1A37F', fontWeight: '600' }}>Color Palette:</span> {Array.isArray(product.colorPalette) ? product.colorPalette.join(', ') : product.colorPalette}
              </p>
              <p style={{ marginBottom: '0', color: '#374151', lineHeight: '1.5', fontSize: '18px' }}>
                <span style={{ color: '#C1A37F', fontWeight: '600' }}>Created:</span> {new Date(product.createdAt).toLocaleDateString('en-US', {
                  timeZone: 'Asia/Colombo',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>,
    document.body
  );
};

export default ProductPopup;