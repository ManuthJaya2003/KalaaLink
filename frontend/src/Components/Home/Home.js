import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainNav from '../MainNav/MainNav';
import './Home.css';
import MainFooter from '../MainFooter/MainFooter';
import VirtualGallery from '../Thaveesha/ContactUs/VirtualGallery';
import Slider from '../Slider/Slider';

function Home() {
  const navigate = useNavigate();
  const testimonialsRef = useRef(null);
  const partnersTrackRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedLogos, setAnimatedLogos] = useState(new Set());
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved partners from database
  useEffect(() => {
    fetchApprovedPartners();
  }, []);

  const fetchApprovedPartners = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/partnerships/approved');
      setPartners(response.data.partnershipRequests || []);
    } catch (error) {
      console.error('Error fetching approved partners:', error);
      // Keep empty array if fetch fails
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollTestimonials = (direction) => {
    const slider = testimonialsRef.current;
    if (!slider) return;
    
    const cardWidth = 350; // Width of each testimonial card
    const gap = 30; // Gap between cards
    const scrollAmount = cardWidth + gap;
    
    if (direction === 'next') {
      slider.scrollLeft += scrollAmount;
      setCurrentTestimonial(prev => Math.min(prev + 1, 5)); // 6 testimonials total (0-5)
    } else {
      slider.scrollLeft -= scrollAmount;
      setCurrentTestimonial(prev => Math.max(prev - 1, 0));
    }
  };

  // Center detection for partner logos
  useEffect(() => {
    const checkCenterPosition = () => {
      if (!partnersTrackRef.current) return;
      
      const track = partnersTrackRef.current;
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;
      
      const logos = track.querySelectorAll('.partner-logo');
      logos.forEach((logo, index) => {
        const logoRect = logo.getBoundingClientRect();
        const logoCenterX = logoRect.left + logoRect.width / 2;
        
        // Check if logo is near center (within 60px)
        if (Math.abs(logoCenterX - centerX) < 60) {
          const logoId = `logo-${index}`;
          if (!animatedLogos.has(logoId)) {
            logo.classList.add('animate-pop');
            setAnimatedLogos(prev => new Set([...prev, logoId]));
            
            // Remove animation class after animation completes
            setTimeout(() => {
              logo.classList.remove('animate-pop');
            }, 800);
          }
        }
      });
    };

    const interval = setInterval(checkCenterPosition, 50);
    return () => clearInterval(interval);
  }, [animatedLogos]);
  
  return (
    <div className="home-page">
      {/* Slider/Carousel - At the very top */}
      <Slider />
      
      {/* Navigation - Overlaying the slider */}
      <MainNav />
      
      {/* Soft Intro Section */}
      <section className="intro-section">
        <div className="intro-container">
          <h1 className="intro-headline">Discover & Celebrate Talented Artists</h1>
          <p className="intro-subtext">Explore unique art, connect with creators, and be inspired. Discover talented artists from around the world, book their services for your events, and support the creative community that brings beauty and meaning to our lives.</p>
          
          <div className="intro-cta-buttons">
            <button className="intro-btn" onClick={() => navigate('/artists')}>
              Explore Artists
            </button>
            <button className="intro-btn" onClick={() => navigate('/register')}>
              Join as Artists
            </button>
          </div>
          
          <div className="intro-feature-widgets">
            <div className="feature-widget">
              <img className="widget-icon" src="/m.png" alt="Marketplace" />
              <span className="widget-text">Marketplace</span>
              <span className="widget-description">Buy & Sell Artwork</span>
            </div>
            <div className="feature-widget">
              <img className="widget-icon" src="/d.png" alt="Donations" />
              <span className="widget-text">Donations</span>
              <span className="widget-description">Support Your Favorite Artists</span>
            </div>
            <div className="feature-widget">
              <img className="widget-icon" src="/a.png" alt="Artists" />
              <span className="widget-text">Artists</span>
              <span className="widget-description">Find Your Favorite Artists</span>
            </div>
            <div className="feature-widget">
              <img className="widget-icon" src="/e.png" alt="Events" />
              <span className="widget-text">Events</span>
              <span className="widget-description">Discover Upcoming Events</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Virtual Art Gallery */}
      <section className="gallery-section">
        <div className="gallery-header">
          <h2>Virtual Art Gallery</h2>
          <p>Explore our curated collection in 360° immersive experience. Discover stunning artworks from talented artists around the world, view detailed pieces up close, and experience art like never before in our virtual gallery space.</p>
        </div>
        <VirtualGallery />
      </section>
      
      {/* Services / Offerings Section */}
      <section className="services-section">
        <div className="services-container">
          {/* Artists Service */}
          <div className="service-block service-left">
            <div className="service-content">
              <h3 className="service-headline">Discover Artists and Book Anywhere, Anytime</h3>
              <p className="service-description">
                Connect with talented artists and book their services instantly through our comprehensive platform. Our diverse community of verified artists offers professional services tailored to your needs. Browse portfolios, read reviews, and book with confidence.
              </p>
              <ul className="service-features">
                <li>Book artists instantly</li>
                <li>Browse artist portfolios</li>
                <li>Ratings and reviews for quality assurance</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/artists')}>
                Explore Artists
              </button>
            </div>
            <div className="service-image artist-image">
              <img 
                src="/artist.jpg" 
                alt="Artists working in studio"
              />
            </div>
          </div>

          {/* Events Service */}
          <div className="service-block service-right">
            <div className="service-image">
              <img 
                src="/event.jpg" 
                alt="Art event and exhibition"
              />
            </div>
            <div className="service-content">
              <h3 className="service-headline">Enjoy and Explore Upcoming Events with Your Favorite Artists</h3>
              <p className="service-description">
                Stay updated with the latest events and book tickets to see your favorite artists perform live. From gallery openings to cultural festivals, our platform brings together the most exciting creative events in your community.
              </p>
              <ul className="service-features">
                <li>Event schedules</li>
                <li>Ticket booking</li>
                <li>Notifications & reminders</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/Events')}>
                View Events
              </button>
            </div>
          </div>

          {/* Donations Service */}
          <div className="service-block service-left">
            <div className="service-content">
              <h3 className="service-headline">Support Artists You Love</h3>
              <p className="service-description">
                Help artists continue creating amazing work by supporting them directly through our secure donation platform. Your contributions help talented creators focus on their craft and bring their artistic visions to life.
              </p>
              <ul className="service-features">
                <li>Secure payments</li>
                <li>Track your contributions</li>
                <li>Special rewards for donors</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/donordashboard')}>
                Donate Now
              </button>
            </div>
            <div className="service-image">
              <img 
                src="/support.jpg" 
                alt="Supporting artists through donations"
              />
            </div>
          </div>

          {/* Marketplace Service */}
          <div className="service-block service-right">
            <div className="service-image art-image">
              <img 
                src="/art.jpg" 
                alt="Art marketplace and gallery"
              />
            </div>
            <div className="service-content">
              <h3 className="service-headline">Discover and Buy Unique Art</h3>
              <p className="service-description">
                Browse and purchase original artwork from talented artists in our curated marketplace. From paintings and sculptures to digital art and handmade crafts, our marketplace features carefully selected pieces from artists worldwide.
              </p>
              <ul className="service-features">
                <li>Browse curated collections</li>
                <li>Secure checkout</li>
                <li>Shipping and tracking</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/marketplace')}>
                Visit Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics/Trust Section */}
      <section className="statistics-section">
        <div className="statistics-header">
          <h2 className="statistics-title">Our Growing Community in Numbers</h2>
          <p className="statistics-subtitle">Join thousands of artists and customers who trust KalaaLink for their creative needs</p>
        </div>
        <div className="statistics-container">
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Artists Registered</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5000+</div>
            <div className="stat-label">Customers Served</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">200+</div>
            <div className="stat-label">Partnerships Worldwide</div>
          </div>
        </div>
      </section>


      {/* Testimonials Widget */}
      <section className="testimonials-widget-section">
        <div className="testimonials-container">
          <h2 className="testimonials-title">What Our Users Say</h2>
          <div className="testimonials-wrapper">
            <button className="testimonial-nav-btn testimonial-prev" onClick={() => scrollTestimonials('prev')}>
              <span>‹</span>
            </button>
            <div className="testimonials-slider" ref={testimonialsRef}>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"KalaaLink has revolutionized how I discover and book artists. The platform is intuitive and the artists are incredibly talented."</p>
                  <div className="testimonial-author">
                    <div className="author-name">Jennifer Chen</div>
                    <div className="author-role">Event Planner</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"As an artist, this platform has given me amazing opportunities to showcase my work and connect with clients worldwide."</p>
                  <div className="testimonial-author">
                    <div className="author-name">Michael Torres</div>
                    <div className="author-role">Digital Artist</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"The marketplace is fantastic! I've found unique pieces that perfectly match my home's aesthetic."</p>
                  <div className="testimonial-author">
                    <div className="author-name">Lisa Anderson</div>
                    <div className="author-role">Interior Designer</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"Outstanding customer service and the quality of artists is exceptional. Highly recommend for any creative project."</p>
                  <div className="testimonial-author">
                    <div className="author-name">David Kim</div>
                    <div className="author-role">Marketing Director</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"The events feature helped me discover amazing local artists and cultural experiences I never knew existed."</p>
                  <div className="testimonial-author">
                    <div className="author-name">Sarah Williams</div>
                    <div className="author-role">Art Enthusiast</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"As a gallery owner, KalaaLink has been instrumental in connecting me with talented emerging artists."</p>
                  <div className="testimonial-author">
                    <div className="author-name">Robert Martinez</div>
                    <div className="author-role">Gallery Owner</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="testimonial-nav-btn testimonial-next" onClick={() => scrollTestimonials('next')}>
              <span>›</span>
            </button>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="partners-section">
        <div className="partners-container">
          <h2 className="partners-title">Our Partners</h2>
          {loading ? (
            <div className="partners-loading">Loading partners...</div>
          ) : partners.length === 0 ? (
            <div className="partners-empty">
              <p>We're working on building partnerships. Check back soon!</p>
            </div>
          ) : (
            <div className="partners-slider">
              <div className="partners-track" ref={partnersTrackRef}>
                {partners.map((partner) => (
                  <div key={partner._id} className="partner-logo">
                    {partner.logo ? (
                      <img 
                        src={partner.logo} 
                        alt={`${partner.organizationName} logo`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="logo-placeholder" style={{ display: partner.logo ? 'none' : 'flex' }}>
                      <span>{partner.organizationName.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                ))}
                {/* Duplicate logos for seamless loop */}
                {partners.map((partner) => (
                  <div key={`duplicate-${partner._id}`} className="partner-logo">
                    {partner.logo ? (
                      <img 
                        src={partner.logo} 
                        alt={`${partner.organizationName} logo`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="logo-placeholder" style={{ display: partner.logo ? 'none' : 'flex' }}>
                      <span>{partner.organizationName.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ending Note */}
      <section className="ending-note-section">
        <div className="ending-note-container">
          <p className="ending-note-text">Thank you for supporting our journey — together we make art thrive and create meaningful connections that inspire creativity across our community.</p>
          <div className="ending-note-decoration"></div>
        </div>
      </section>
      
      <MainFooter />
    </div>
  );
}

export default Home;