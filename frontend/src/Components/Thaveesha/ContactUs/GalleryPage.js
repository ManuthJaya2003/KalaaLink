import React from "react";
import "./GalleryPage.css";
import MainNav from "../../MainNav/MainNav";
import MainFooter from "../../MainFooter/MainFooter";
import VirtualGallery from "./VirtualGallery";

function GalleryPage() {
  return (
    <div>
      <MainNav />
      <div className="gallery-page-container">
        {/* Gallery Header */}
        <section className="gallery-hero">
          <div className="hero-content">
            <h1>Virtual Art Gallery</h1>
            <p>Experience our curated collection in an immersive 360° environment</p>
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🎨</span>
                <span>Curated Collection</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔄</span>
                <span>360° Navigation</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>Mobile Optimized</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Instructions */}
        <section className="gallery-instructions">
          <div className="instructions-content">
            <h2>How to Navigate</h2>
            <div className="instruction-grid">
              <div className="instruction-item">
                <div className="instruction-icon">🖱️</div>
                <h3>Desktop</h3>
                <p>Click and drag to rotate the view around the gallery</p>
              </div>
              <div className="instruction-item">
                <div className="instruction-icon">📱</div>
                <h3>Mobile</h3>
                <p>Swipe left, right, up, and down to explore</p>
              </div>
              <div className="instruction-item">
                <div className="instruction-icon">👁️</div>
                <h3>Explore</h3>
                <p>Hover over artworks to see details and artist information</p>
              </div>
              <div className="instruction-item">
                <div className="instruction-icon">🎯</div>
                <h3>Focus</h3>
                <p>Each wall showcases different artistic styles and themes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Virtual Gallery */}
        <section className="gallery-main">
          <VirtualGallery />
        </section>

        {/* Gallery Information */}
        <section className="gallery-info">
          <div className="info-content">
            <h2>About Our Collection</h2>
            <p>
              Our virtual gallery features a diverse selection of contemporary artworks 
              from emerging and established artists. Each piece has been carefully curated 
              to represent different styles, techniques, and cultural perspectives.
            </p>
            
            <div className="collection-stats">
              <div className="stat">
                <span className="stat-number">6</span>
                <span className="stat-label">Featured Artworks</span>
              </div>
              <div className="stat">
                <span className="stat-number">6</span>
                <span className="stat-label">Artists</span>
              </div>
              <div className="stat">
                <span className="stat-number">4</span>
                <span className="stat-label">Gallery Walls</span>
              </div>
              <div className="stat">
                <span className="stat-number">360°</span>
                <span className="stat-label">Full View</span>
              </div>
            </div>

            <div className="artwork-categories">
              <h3>Artwork Categories</h3>
              <div className="category-tags">
                <span className="category-tag">Abstract</span>
                <span className="category-tag">Contemporary</span>
                <span className="category-tag">Digital Art</span>
                <span className="category-tag">Expressionism</span>
                <span className="category-tag">Landscape</span>
                <span className="category-tag">Cultural</span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="gallery-cta">
          <div className="cta-content">
            <h2>Interested in Our Artists?</h2>
            <p>Discover more works, book consultations, or commission custom pieces</p>
            <div className="cta-buttons">
              <button className="cta-btn primary">Browse All Artists</button>
              <button className="cta-btn secondary">Contact Us</button>
            </div>
          </div>
        </section>
      </div>
      <MainFooter />
    </div>
  );
}

export default GalleryPage;
