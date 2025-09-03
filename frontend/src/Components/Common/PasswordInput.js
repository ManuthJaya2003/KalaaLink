import React, { useState } from 'react';
import './PasswordInput.css';

const PasswordInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = '',
  label,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">{label}</label>
      )}
      <div className="password-input-container">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          className={`form-input password-input ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
