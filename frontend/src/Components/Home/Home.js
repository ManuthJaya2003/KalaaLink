import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import './Home.css';
import MainFooter from '../MainFooter/MainFooter';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const slides = [
    {
      image: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
      title: "Discover Amazing Artists",
      description: "Find and manage your favorite artists in one place",
      buttonText: "Browse Artists",
      buttonAction: () => navigate('/artists')
    },
    {
      image: "url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
      title: "Upcoming Events",
      description: "Never miss a concert or performance",
      buttonText: "View Events"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-page">
      {/* Navbar - No wrapper needed, MainNav handles its own styling */}
      <MainNav />
      
      {/* Main Content Container */}
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-slider">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`hero-slide ${index === currentSlide ? 'hero-slide--active' : ''}`}
                style={{ backgroundImage: slide.image }}
              >
                <div className="hero-slide__content">
                  <h2 className="hero-slide__title">{slide.title}</h2>
                  <p className="hero-slide__description">{slide.description}</p>
                  <button 
                    className="hero-slide__button" 
                    onClick={slide.buttonAction || (() => {})}
                  >
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Slider Navigation */}
            <div className="hero-slider__navigation">
              {slides.map((_, index) => (
                <button 
                  key={index}
                  className={`hero-slider__dot ${index === currentSlide ? 'hero-slider__dot--active' : ''}`}
                  onClick={() => handleSlideChange(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Quick Browse Section */}
        <section className="quick-browse-section">
          <div className="container">
            <h2 className="section-title">Quick Browse</h2>
            <div className="quick-browse__options">
              <button 
                className="quick-browse__button"
                onClick={() => navigate('/artists')}
              >
                Browse All Artists
              </button>
            </div>
          </div>
        </section>
        
        {/* Featured Artists Section */}
        <section className="featured-artists-section">
          <div className="container">
            <h2 className="section-title">Featured Artists</h2>
            <div className="featured-artists__grid">
              <div className="featured-artist-card" onClick={() => navigate('/artists')}>
                <div className="featured-artist-card__image">
                  <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Artist One" />
                </div>
                <div className="featured-artist-card__info">
                  <h3 className="featured-artist-card__name">Artist One</h3>
                  <p className="featured-artist-card__genre">Pop</p>
                </div>
              </div>
              <div className="featured-artist-card" onClick={() => navigate('/artists')}>
                <div className="featured-artist-card__image">
                  <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="Artist Two" />
                </div>
                <div className="featured-artist-card__info">
                  <h3 className="featured-artist-card__name">Artist Two</h3>
                  <p className="featured-artist-card__genre">Rock</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MainFooter/>
    </div>
  );
}

export default Home;