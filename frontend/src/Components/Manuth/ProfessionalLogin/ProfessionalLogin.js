import React, { useState } from 'react';
import MainNav from '../../MainNav/MainNav';

function ProfessionalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log({ email, password, role });
  };

  return (
    <div>
        <MainNav/>

      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: '15px' }}>
            <label>Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="artist_manager">Artist Manager</option>
              <option value="event_manager">Event Manager</option>
              <option value="marketplace_manager">Marketplace Manager</option>
              <option value="donation_manager">Donation Manager</option>
            </select>
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfessionalLogin;
