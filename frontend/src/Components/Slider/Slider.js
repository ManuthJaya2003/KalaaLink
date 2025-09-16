import React from 'react';
import './Slider.css';

const Slider = () => {
  return (
    <div className="hero-video">
      <video
        className="background-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/homePageVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Slider;