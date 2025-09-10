import React from 'react';
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
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">{label}</label>
      )}
      <div className="password-input-container">
        <input
          type="password"
          id={id}
          name={name}
          className={`form-input password-input ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
      </div>
    </div>
  );
};

export default PasswordInput;
