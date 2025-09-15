import React from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, interactive = false, size = 'medium' }) => {
  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''} ${size}`}
          onClick={() => handleStarClick(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="star-rating">
      {renderStars()}
      {interactive && (
        <span className="rating-text">
          {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Click to rate'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
