import React, { useState } from 'react';
import MainNav from '../../MainNav/MainNav';

function ProfessionalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // e.g., Admin, Artist Manager, Teacher

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log the values
    console.log({ email, password, role });
    // Later: call backend API for login
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <MainNav />

      <div className="bg-white p-8 rounded shadow-md w-full max-w-md mt-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Professional Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="ArtistManager">Artist Manager</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfessionalLogin;
