import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import './Home.css';
import MainFooter from '../MainFooter/MainFooter';
import VirtualGallery from '../Thaveesha/ContactUs/VirtualGallery';
import Slider from '../Slider/Slider';

function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="home-page">
      {/* Slider/Carousel - At the very top */}
      <Slider />
      
      {/* Navigation - Overlaying the slider */}
      <MainNav />
      
      {/* Virtual Art Gallery */}
      <section className="gallery-section">
        <div className="gallery-header">
          <h2>Virtual Art Gallery</h2>
          <p>Explore our curated collection in 360°</p>
        </div>
        <VirtualGallery />
      </section>
      
      {/* Main Content */}
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                Streamline Your Artistic Business with 
                <span className="flower-accent"></span>
                Professional Management Tools
              </h1>
              <p className="hero-subtitle">
                KalaaLink provides comprehensive artist management solutions for booking, 
                portfolio management, and business growth. Connect with clients and expand your reach.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-large" onClick={() => navigate('/artists')}>
                  Browse Artists
                  <span className="arrow-icon">→</span>
                </button>
                <button className="btn btn-outline btn-large" onClick={() => navigate('/register')}>
                  Join as Artist
                </button>
              </div>
              
              {/* Artist Categories */}
              <div className="artist-categories">
                <a href="#visual" className="category-link">
                  <span className="star-accent"></span>
                  Visual Artists
                </a>
                <a href="#performance" className="category-link">
                  <span className="star-accent"></span>
                  Performance Artists
                </a>
                <a href="#musical" className="category-link">
                  <span className="star-accent"></span>
                  Musical Artists
                </a>
                <a href="#digital" className="category-link">
                  <span className="star-accent"></span>
                  Digital Artists
                </a>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Professional artist in creative workspace"
              />
              <div className="verification-badge">
                <span className="badge-text">Trusted by 1000+ Artists</span>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="section">
          <div className="container">
            <div className="stats-highlight">
              <div className="stats-card card-elevated">
                <h3>500+ Registered Artists</h3>
                <p>across various disciplines</p>
                <div className="stats-breakdown">
                  <div className="stat-item">
                    <span className="stat-number">200+</span>
                    <span className="stat-label">Visual Artists</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">150+</span>
                    <span className="stat-label">Performance Artists</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">Musical Artists</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Digital Artists</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">Platform Features</h2>
            <div className="directory-logos">
              <div className="feature-item">
                <span className="feature-text">Portfolio Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-text">Booking System</span>
              </div>
              <div className="feature-item">
                <span className="feature-text">Event Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-text">Payment Processing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">Artist Management Services</h2>
            <div className="grid grid-3">
              <div className="service-card" onClick={() => navigate('/artists')}>
                <div className="service-icon">🎨</div>
                <h3 className="service-title">Portfolio Management</h3>
                <p className="service-description">
                  Create and maintain professional portfolios to showcase your work and attract clients.
                </p>
              </div>
              
              <div className="service-card" onClick={() => navigate('/events')}>
                <div className="service-icon">📅</div>
                <h3 className="service-title">Event Management</h3>
                <p className="service-description">
                  Organize and manage events, exhibitions, and performances with our integrated tools.
                </p>
              </div>
              
              <div className="service-card">
                <div className="service-icon">💼</div>
                <h3 className="service-title">Booking System</h3>
                <p className="service-description">
                  Streamlined booking process for clients to hire artists for various projects.
                </p>
              </div>
              
              <div className="service-card">
                <div className="service-icon">💰</div>
                <h3 className="service-title">Payment Processing</h3>
                <p className="service-description">
                  Secure payment handling for commissions, bookings, and art sales.
                </p>
              </div>
              
              <div className="service-card">
                <div className="service-icon">📊</div>
                <h3 className="service-title">Analytics Dashboard</h3>
                <p className="service-description">
                  Track your performance, client engagement, and business growth metrics.
                </p>
              </div>
              
              <div className="service-card">
                <div className="service-icon">🤝</div>
                <h3 className="service-title">Client Management</h3>
                <p className="service-description">
                  Manage client relationships, communications, and project timelines effectively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artists Section */}
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">Featured Artists</h2>
            <div className="grid grid-auto-fit">
              <div className="artist-card card" onClick={() => navigate('/artists')}>
                <div className="artist-image">
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Sarah Johnson" />
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">Sarah Johnson</h3>
                  <p className="artist-specialty">Contemporary Painter</p>
                  <p className="artist-description">
                    Specializing in abstract expressionism with bold colors and dynamic compositions.
                  </p>
                  <button className="btn btn-outline btn-small">View Portfolio</button>
                </div>
              </div>
              
              <div className="artist-card card" onClick={() => navigate('/artists')}>
                <div className="artist-image">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Michael Chen" />
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">Michael Chen</h3>
                  <p className="artist-specialty">Sculptor</p>
                  <p className="artist-description">
                    Creating innovative sculptures that blend traditional techniques with modern concepts.
                  </p>
                  <button className="btn btn-outline btn-small">View Portfolio</button>
                </div>
              </div>
              
              <div className="artist-card card" onClick={() => navigate('/artists')}>
                <div className="artist-image">
                  <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Emily Rodriguez" />
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">Emily Rodriguez</h3>
                  <p className="artist-specialty">Digital Artist</p>
                  <p className="artist-description">
                    Pioneering new forms of digital expression through interactive installations.
                  </p>
                  <button className="btn btn-outline btn-small">View Portfolio</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="section">
          <div className="container">
            <div className="cta-section">
              <h2 className="section-title">Ready to Manage Your Artistic Career?</h2>
              <p className="cta-description">
                Join thousands of artists who trust KalaaLink for their business management needs.
              </p>
              <div className="cta-actions">
                <button className="btn btn-primary btn-large" onClick={() => navigate('/artists')}>
                  Browse Artists
                  <span className="arrow-icon">→</span>
                </button>
                <button className="btn btn-secondary btn-large" onClick={() => navigate('/register')}>
                  Register as Artist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section with Organic Shape */}
        <section className="section">
          <div className="container">
            <div className="organic-section">
              <div className="organic-content">
                <h2 className="organic-title">
                  Building successful artistic careers together with 
                  <span className="flower-accent"></span>
                  KalaaLink's management platform
                </h2>
                <p className="organic-description">
                  Our platform is committed to supporting artists through every step of their professional journey, 
                  from portfolio creation to client management and business growth.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <MainFooter />
    </div>
  );
}

export default Home;