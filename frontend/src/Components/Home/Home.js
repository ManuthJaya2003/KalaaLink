import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import MainNav from '../MainNav/MainNav';
import './Home.css';
import MainFooter from '../MainFooter/MainFooter';
import VirtualGallery from '../Thaveesha/ContactUs/VirtualGallery';
import Slider from '../Slider/Slider';

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
          <h1 className="intro-headline">{t('discoverCelebrate')}</h1>
          <p className="intro-subtext">{t('exploreUniqueArt')}</p>
          
          <div className="intro-cta-buttons">
            <button className="intro-btn" onClick={() => navigate('/artists')}>
              {t('exploreArtists')}
            </button>
            <button className="intro-btn" onClick={() => navigate('/register')}>
              {t('joinAsArtists')}
            </button>
          </div>
          
          <div className="intro-feature-widgets">
            <div className="feature-widget">
              <img className="widget-icon" src="/m.png" alt="Marketplace" />
              <span className="widget-text">{t('marketplace')}</span>
              <span className="widget-description">{t('buySellArtwork')}</span>
            </div>
            <div className="feature-widget">
              <img className="widget-icon" src="/d.png" alt="Donations" />
              <span className="widget-text">{t('donations')}</span>
              <span className="widget-description">{t('supportFavoriteArtists')}</span>
            </div>
            <div className="feature-widget">
              <img className="widget-icon" src="/a.png" alt="Artists" />
              <span className="widget-text">{t('artists')}</span>
              <span className="widget-description">{t('findFavoriteArtists')}</span>
            </div>
            <div className="feature-widget">
              <img className="widget-icon" src="/e.png" alt="Events" />
              <span className="widget-text">{t('events')}</span>
              <span className="widget-description">{t('discoverUpcomingEvents')}</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Virtual Art Gallery */}
      <section className="gallery-section">
        <div className="gallery-header">
          <h2>{t('virtualArtGallery')}</h2>
          <p>{t('exploreCuratedCollection')}</p>
        </div>
        <VirtualGallery />
      </section>
      
      {/* Services / Offerings Section */}
      <section className="services-section">
        <div className="services-container">
          {/* Artists Service */}
          <div className="service-block service-left">
            <div className="service-content">
              <h3 className="service-headline">{t('discoverArtistsConnect')}</h3>
              <p className="service-description">
                {t('engageWithTalentedArtists')}
              </p>
              <ul className="service-features">
                <li>{t('connectWithArtistsInstantly')}</li>
                <li>{t('exploreInspiringPortfolios')}</li>
                <li>{t('verifiedReviewsTrustedCollaborations')}</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/artists')}>
                {t('exploreArtists')}
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
              <h3 className="service-headline">{t('enjoyExploreUpcomingEvents')}</h3>
              <p className="service-description">
                {t('stayUpdatedLatestEvents')}
              </p>
              <ul className="service-features">
                <li>{t('eventSchedules')}</li>
                <li>{t('ticketBooking')}</li>
                <li>{t('notificationsReminders')}</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/Events')}>
                {t('viewEvents')}
              </button>
            </div>
          </div>

          {/* Donations Service */}
          <div className="service-block service-left">
            <div className="service-content">
              <h3 className="service-headline">{t('supportArtistsYouLove')}</h3>
              <p className="service-description">
                {t('helpArtistsContinueCreating')}
              </p>
              <ul className="service-features">
                <li>{t('securePayments')}</li>
                <li>{t('trackContributions')}</li>
                <li>{t('specialRewardsDonors')}</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/donordashboard')}>
                {t('donateNow')}
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
              <h3 className="service-headline">{t('discoverBuyUniqueArt')}</h3>
              <p className="service-description">
                {t('browsePurchaseOriginalArtwork')}
              </p>
              <ul className="service-features">
                <li>{t('browseCuratedCollections')}</li>
                <li>{t('secureCheckout')}</li>
                <li>{t('shippingTracking')}</li>
              </ul>
              <button className="service-cta" onClick={() => navigate('/marketplace')}>
                {t('visitMarketplace')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics/Trust Section */}
      <section className="statistics-section">
        <div className="statistics-header">
          <h2 className="statistics-title">{t('ourGrowingCommunity')}</h2>
          <p className="statistics-subtitle">{t('joinThousandsArtists')}</p>
        </div>
        <div className="statistics-container">
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">{t('artistsRegistered')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5000+</div>
            <div className="stat-label">{t('customersServed')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">200+</div>
            <div className="stat-label">{t('partnershipsWorldwide')}</div>
          </div>
        </div>
      </section>


      {/* Testimonials Widget */}
      <section className="testimonials-widget-section">
        <div className="testimonials-container">
          <h2 className="testimonials-title">{t('whatOurUsersSay')}</h2>
          <div className="testimonials-wrapper">
            <button className="testimonial-nav-btn testimonial-prev" onClick={() => scrollTestimonials('prev')}>
              <span>‹</span>
            </button>
            <div className="testimonials-slider" ref={testimonialsRef}>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{t('testimonial1')}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{t('testimonial1Author')}</div>
                    <div className="author-role">{t('testimonial1Role')}</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{t('testimonial2')}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{t('testimonial2Author')}</div>
                    <div className="author-role">{t('testimonial2Role')}</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{t('testimonial3')}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{t('testimonial3Author')}</div>
                    <div className="author-role">{t('testimonial3Role')}</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{t('testimonial4')}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{t('testimonial4Author')}</div>
                    <div className="author-role">{t('testimonial4Role')}</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{t('testimonial5')}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{t('testimonial5Author')}</div>
                    <div className="author-role">{t('testimonial5Role')}</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{t('testimonial6')}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{t('testimonial6Author')}</div>
                    <div className="author-role">{t('testimonial6Role')}</div>
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
          <h2 className="partners-title">{t('ourPartners')}</h2>
          {loading ? (
            <div className="partners-loading">{t('loadingPartners')}</div>
          ) : partners.length === 0 ? (
            <div className="partners-empty">
              <p>{t('buildingPartnerships')}</p>
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
          <p className="ending-note-text">{t('thankYouSupporting')}</p>
          <div className="ending-note-decoration"></div>
        </div>
      </section>
      
      <MainFooter />
    </div>
  );
}

export default Home;