import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function ProductReviews() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ customerName: '', rating: 5, comment: '' });

  useEffect(() => {
    fetch(`http://localhost:5000/api/reviews/product/${id}`)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.status}`);
        return response.json();
      })
      .then(data => setReviews(data))
      .catch(error => console.error('Error fetching reviews:', error.message));
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, ...formData })
      });
      const data = await response.json();
      if (response.ok) {
        setReviews([...reviews, data]);
        setFormData({ customerName: '', rating: 5, comment: '' });
        console.log('Review submitted successfully:', data); // Add logging
      } else {
        console.error('Error submitting review:', data.message, response.status); // Enhance error logging
      }
    } catch (error) {
      console.error('Error submitting review:', error.message); // Enhance error logging
    }
  };

  return (
    <div>
      <h2>Reviews for Product {id}</h2>
      {reviews.map(review => (
        <div key={review._id}>
          <p>{review.customerName}: {review.rating} stars</p>
          <p>{review.comment}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={formData.customerName}
          onChange={e => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="Your name"
        />
        <input
          type="number"
          value={formData.rating}
          onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
          min="1"
          max="5"
          placeholder="Rating"
        />
        <textarea
          value={formData.comment}
          onChange={e => setFormData({ ...formData, comment: e.target.value })}
          placeholder="Your comment"
        />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}
export default ProductReviews;