import React from 'react';
import './AuthFooter.css';

function AuthFooter() {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-content">
        <div className="auth-footer-brand">
          <img 
            src="/logo.png" 
            alt="KalaaLink Logo" 
            className="auth-footer-logo"
          />
          <span className="auth-footer-text">KalaaLink © 2025</span>
        </div>
      </div>
    </footer>
  );
}

export default AuthFooter;
