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
    const { size, artistName, frameSize, colorPalette, artType, price, image, createdAt } = props.product;
    return (
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h1>Product Details</h1>
        <h2>Size: {size}</h2>
        <h2>Artist Name: {artistName}</h2>
        <h2>Frame Size: {frameSize}</h2>
        <h2>Color Palette: {Array.isArray(colorPalette) ? colorPalette.join(', ') : colorPalette}</h2>
        <h2>Art Type: {artType}</h2>
        <h2>Price: LKR {price}</h2>
        <h2>Image: <img src={image} alt={artType} style={{ maxWidth: '200px' }} /></h2>
        <h2>
          Created At:{' '}
          {new Date(createdAt).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </h2>
        <button
          onClick={() => props.setEditing(props.product)}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>
        <button
          onClick={() => setIsPopupOpen(true)}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          View Details
        </button>
        {isPopupOpen && (
          <ProductPopup
            product={props.product}
            onClose={() => setIsPopupOpen(false)}
            onAddToCart={handleAddToCart}
          />
        )}
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Customer Reviews</h2>
          {reviewError && (
            <p style={{ color: '#ef4444', marginBottom: '10px' }}>{reviewError}</p>
          )}
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review._id}
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              >
                <p style={{ fontWeight: 'bold' }}>
                  {review.customerName} ({review.rating} Stars)
                </p>
                <p>{review.comment}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>
                  {new Date(review.createdAt).toLocaleString('en-US', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete Review
                </button>
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>{isEditing ? 'Edit Product' : 'Add Product'}</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        encType="multipart/form-data"
      >
        <div>
          <label>Size: </label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Artist Name: </label>
          <input
            type="text"
            name="artistName"
            value={formData.artistName}
            onChange={handleInputChange}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Frame Size: </label>
          <input
            type="text"
            name="frameSize"
            value={formData.frameSize}
            onChange={handleInputChange}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Color Palette (comma-separated): </label>
          <input
            type="text"
            name="colorPalette"
            value={formData.colorPalette}
            onChange={handleInputChange}
            placeholder="e.g., Red, Blue, Green"
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Art Type: </label>
          <input
            type="text"
            name="artType"
            value={formData.artType}
            onChange={handleInputChange}
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Price: </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            required
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Image: </label>
          <input
            id="image-input"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            style={{ padding: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
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
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
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

export default Product;