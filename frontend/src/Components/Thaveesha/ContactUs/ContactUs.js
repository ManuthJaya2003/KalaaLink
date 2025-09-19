import React, { useState } from "react";
import "./ContactUs.css";
import MainNav from "../../MainNav/MainNav";
import MainFooter from "../../MainFooter/MainFooter";
import ComplaintForm from "./ComplaintForm";
import LiveLocationMap from "./LiveLocationMap";

function ContactUs() {
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const openComplaintForm = () => {
    setIsComplaintFormOpen(true);
  };

  const closeComplaintForm = () => {
    setIsComplaintFormOpen(false);
  };

  const handleComplaintSuccess = () => {
    setShowSuccessMessage(true);
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <div>
      <MainNav />
      <div className="contact-container">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span>Your complaint has been submitted successfully! We'll get back to you soon.</span>
            </div>
            <button 
              className="success-close" 
              onClick={() => setShowSuccessMessage(false)}
            >
              ×
            </button>
          </div>
        )}

        {/* About */}
        <section className="about-section">
          <div className="about-text">
            <h2>About KalaaLink</h2>
            <p>
              KalaaLink is the premier platform dedicated to bridging the gap
              between talented artists and a global audience. Our mission is to
              provide artists with the tools, resources, and exposure they need to
              thrive in their creative careers. We believe that art is a vital part
              of culture, and by supporting artists, we enrich our communities and
              the world.
            </p>
            <p>
              From managing bookings and selling artwork to fostering collaborations
              and organizing events, KalaaLink is a comprehensive ecosystem for
              creative professionals. We are passionate about curating a diverse and
              vibrant community where creativity is celebrated, and artists can
              achieve their full potential.
            </p>
          </div>

          {/* Contact Card */}
          <div className="contact-card">
            <h3>Get in Touch</h3>
            <div className="contact-item">
              <div className="icon-circle">✉</div>
              <div>
                <h4>Email</h4>
                <p>General Inquiries &amp; Support</p>
                <a href="mailto:contact@kalaalink.com">contact@kalaalink.com</a>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon-circle">📞</div>
              <div>
                <h4>Phone</h4>
                <p>Mon–Fri, 9:00–17:00</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="icon-circle">📍</div>
              <div>
                <h4>Our Office</h4>
                <p>123 Creative Lane,</p>
                <p>Art City, AC 54321</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Location Map */}
        <LiveLocationMap />

        {/* Help Center */}
        <section className="help-section">
          <h2>Help Center</h2>
          <p>Have a problem or need assistance? We're here to help.</p>
          <p className="help-subtext">
            Our dedicated support team is available to assist you with any questions, concerns, or issues you may have. 
            Whether you need help with your account, have questions about our services, or want to report a problem, 
            we're committed to providing you with timely and helpful assistance.
          </p>
          <button className="help-btn" onClick={openComplaintForm}>Lodge a Complaint</button>
        </section>

        {/* Complaint Form Modal */}
        <ComplaintForm
          isOpen={isComplaintFormOpen}
          onClose={closeComplaintForm}
          onSubmitSuccess={handleComplaintSuccess}
        />
      </div>
      <MainFooter />
    </div>
  );
}

export default ContactUs;