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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {error && <p style={{ textAlign: 'center', color: 'red', marginBottom: '20px' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Customer Name:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Customer Email:</label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Preferred Size:</label>
          <input
            type="text"
            name="preferredSize"
            value={formData.preferredSize}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Preferred Artist Name:</label>
          <input
            type="text"
            name="preferredArtistName"
            value={formData.preferredArtistName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Preferred Color Palette (comma-separated):</label>
          <input
            type="text"
            name="preferredColorPalette"
            value={formData.preferredColorPalette.join(', ')}
            onChange={handleColorChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>


        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Preferred Art Type:</label>
          <input
            type="text"
            name="preferredArtType"
            value={formData.preferredArtType}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Budget (Rs.):</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Additional Notes:</label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        {formData.productId && (
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Associated Product ID:</strong> {formData.productId}</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {customization ? 'Update' : 'Submit'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CustomizationForm;