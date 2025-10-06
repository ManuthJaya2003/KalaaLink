import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Gallery() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const galleryRef = useRef(null);

  // Fetch gallery images
  const fetchGalleryImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/gallery");
      if (response.data.success) {
        setGalleryImages(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery || galleryImages.length === 0) return;

    // Reset position to start from center
    gallery.style.transform = 'translateX(0)';
    gallery.style.marginLeft = '0';

    const scrollGallery = () => {
      if (gallery) {
        gallery.scrollBy({
          left: 1,
          behavior: 'auto'
        });
      }
    };

    const interval = setInterval(scrollGallery, 30); // Smooth continuous scroll

    return () => clearInterval(interval);
  }, [galleryImages]);

  if (loading) {
    return (
      <div className="gallery-section">
        <div className="gallery-header">
          <h2 className="gallery-title">Event Gallery</h2>
          <p className="gallery-subtitle">Loading gallery images...</p>
        </div>
      </div>
    );
  }

  if (galleryImages.length === 0) {
    return null; // Don't show gallery section if no images
  }

  return (
    <div className="gallery-section">
      <div className="gallery-header">
        <h2 className="gallery-title">Event Gallery</h2>
        <p className="gallery-subtitle">Explore moments from our amazing events</p>
      </div>
      <div className="gallery-wrapper">
        <div className="gallery-slider" ref={galleryRef}>
          {galleryImages.map((image, index) => (
            <div key={`${image._id}-${index}`} className="gallery-item">
              <img 
                src={`http://localhost:5000${image.imageUrl}`}
                alt={image.altText}
                className="gallery-image"
              />
              <div className="gallery-overlay">
                <div className="gallery-info">
                  <h4 className="gallery-item-title">
                    {image.associatedEventId ? image.associatedEventId.eventTitle : "Gallery Image"}
                  </h4>
                  <p className="gallery-item-description">{image.altText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Gallery;
