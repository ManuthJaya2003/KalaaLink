import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCustomization, updateCustomization } from '../api/customizationApi';

function CustomizationForm({ customization, onSave, onCancel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const productId = query.get('productId');

  const [formData, setFormData] = useState({
    customerName: customization?.customerName || '',
    customerEmail: customization?.customerEmail || '',
    description: customization?.description || '',
    preferredSize: customization?.preferredSize || '',
    preferredArtistName: customization?.preferredArtistName || '', // Changed from preferredArtistStyle
    preferredColorPalette: customization?.preferredColorPalette || [],
    preferredArtType: customization?.preferredArtType || '',
    budget: customization?.budget || '',
    additionalNotes: customization?.additionalNotes || '',
    productId: productId || customization?.productId || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleColorChange = (e) => {
    const colors = e.target.value.split(',').map((color) => color.trim());
    setFormData({ ...formData, preferredColorPalette: colors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (customization) {
        await updateCustomization(customization._id, formData, token);
      } else {
        await createCustomization(formData, token);
      }
      if (onSave) {
        onSave();
      } else {
        navigate('/customizationdetails');
      }
      setError('');
    } catch (err) {
      setError(err.toString());
      console.error('Error submitting customization:', err, err.response);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '8px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'visible', 
        minHeight: 0 
      }}>
        {/* 3-Column Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '20px',
          flex: 1,
          width: '100%'
        }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Preferred Size
              </label>
              <input
                type="text"
                name="preferredSize"
                value={formData.preferredSize}
                onChange={handleChange}
                placeholder="e.g., 12x16 inches, A4, etc."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Budget (Rs.)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Enter your budget in rupees"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Customer Email *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Preferred Artist Name
              </label>
              <input
                type="text"
                name="preferredArtistName"
                value={formData.preferredArtistName}
                onChange={handleChange}
                placeholder="Enter preferred artist name (optional)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Preferred Art Type
              </label>
              <input
                type="text"
                name="preferredArtType"
                value={formData.preferredArtType}
                onChange={handleChange}
                placeholder="e.g., portrait, landscape, abstract, etc."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Preferred Color Palette
              </label>
              <input
                type="text"
                name="preferredColorPalette"
                value={formData.preferredColorPalette.join(', ')}
                onChange={handleColorChange}
                placeholder="e.g., blue, green, red (comma-separated)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your customization requirements..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any additional requirements or notes..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>

        {/* Product ID Display */}
        {formData.productId && (
          <div style={{ 
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e1e8ed'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              <strong>Associated Product ID:</strong> {formData.productId}
            </p>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          paddingTop: '0',
          backgroundColor: 'transparent',
          padding: '0',
          margin: '0',
          borderRadius: '0',
          width: '100%',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
          height: '40px',
          visibility: 'visible',
          opacity: 1
        }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '2px solid #000000',
                borderRadius: '8px',
                backgroundColor: '#000000',
                background: '#000000',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: 1,
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                textTransform: 'none',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                visibility: 'visible',
                position: 'relative',
                zIndex: 1000,
                backgroundImage: 'none',
                backgroundGradient: 'none',
                alignSelf: 'flex-end'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.color = '#000000';
                e.target.style.borderColor = '#ffffff';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#000000';
                e.target.style.color = '#ffffff';
                e.target.style.borderColor = '#000000';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              border: '2px solid #C1A37F',
              borderRadius: '8px',
              backgroundColor: '#C1A37F',
              background: '#C1A37F',
              color: '#000000',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flex: 1,
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              textTransform: 'none',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              visibility: 'visible',
              position: 'relative',
              zIndex: 1000,
              backgroundImage: 'none',
              backgroundGradient: 'none',
              alignSelf: 'flex-end'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#000000';
              e.target.style.color = '#ffffff';
              e.target.style.borderColor = '#000000';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#C1A37F';
              e.target.style.color = '#000000';
              e.target.style.borderColor = '#C1A37F';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            }}
          >
            {customization ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomizationForm;