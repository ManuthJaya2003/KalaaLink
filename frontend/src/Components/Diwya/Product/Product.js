import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProductPopup from '../ProductPopup/ProductPopup';
import { useCart } from '../CartContext/CartContext';

const URL = 'http://localhost:5000/api/art';
const REVIEW_URL = 'http://localhost:5000/api/reviews';

function Product(props) {
  const [formData, setFormData] = useState({
    size: '',
    artistName: '',
    frameSize: '',
    colorPalette: '',
    artType: '',
    price: '',
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState('');
  const { setCart } = useCart();

  useEffect(() => {
    if (props.isEditing && props.product) {
      setIsEditing(true);
      setFormData({
        size: props.product.size || '',
        artistName: props.product.artistName || '',
        frameSize: props.product.frameSize || '',
        colorPalette: Array.isArray(props.product.colorPalette) ? props.product.colorPalette.join(', ') : '',
        artType: props.product.artType || '',
        price: props.product.price || '',
        image: null,
      });
    } else if (!props.isEditing && !props.product) {
      setIsEditing(false);
      setFormData({
        size: '',
        artistName: '',
        frameSize: '',
        colorPalette: '',
        artType: '',
        price: '',
        image: null,
      });
    }
  }, [props.isEditing, props.product]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${REVIEW_URL}/product/${props.product._id}`);
      setReviews(response.data);
      setReviewError('');
    } catch (err) {
      setReviewError('Failed to fetch reviews');
    }
  }, [props.product?._id]); // Dependency: props.product._id

  useEffect(() => {
    if (props.product?._id) {
      fetchReviews();
    }
  }, [props.product?._id, fetchReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`${REVIEW_URL}/${reviewId}`);
        setReviews(reviews.filter((review) => review._id !== reviewId));
        setReviewError('');
      } catch (err) {
        setReviewError('Failed to delete review');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('size', formData.size);
    formDataToSend.append('artistName', formData.artistName);
    formDataToSend.append('frameSize', formData.frameSize);
    const colorPaletteArray = formData.colorPalette.split(',').map((color) => color.trim()).filter((color) => color);
    formDataToSend.append('colorPalette', JSON.stringify(colorPaletteArray));
    formDataToSend.append('artType', formData.artType);
    formDataToSend.append('price', Number(formData.price));
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      if (isEditing && props.product?._id) {
        await axios.put(`${URL}/${props.product._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(URL, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      if (props.onAdd) props.onAdd();
      setFormData({
        size: '',
        artistName: '',
        frameSize: '',
        colorPalette: '',
        artType: '',
        price: '',
        image: null,
      });
      document.getElementById('image-input').value = '';
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to submit product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    if (!props.product?._id) return;
    try {
      await axios.delete(`${URL}/${props.product._id}`);
      if (props.onAdd) props.onAdd();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
    }
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
    setIsPopupOpen(false);
  };

  if (props.product && !isEditing) {
    // This component is now only used for the edit modal
    // The product display is handled by the ProductDetails component
    return null;
  }

  return (
    <div className="product-form-container">
      <form
        onSubmit={handleSubmit}
        className="product-form"
        encType="multipart/form-data"
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Artist Name</label>
            <input
              type="text"
              name="artistName"
              value={formData.artistName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Frame Size</label>
            <input
              type="text"
              name="frameSize"
              value={formData.frameSize}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Color Palette</label>
            <input
              type="text"
              name="colorPalette"
              value={formData.colorPalette}
              onChange={handleInputChange}
              placeholder="e.g., Red, Blue, Green"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Art Type</label>
            <input
              type="text"
              name="artType"
              value={formData.artType}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price (LKR)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              className="form-input"
              required
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Image</label>
            <div className="file-upload-container">
              <input
                id="image-input"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="image-input" className="file-upload-label">
                <span className="upload-text">
                  {formData.image ? formData.image.name : "Choose an image file..."}
                </span>
                <span className="upload-hint">Click to browse</span>
              </label>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
          >
            {isEditing ? 'Update Product' : 'Add Product'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                props.setEditing(null);
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Product;