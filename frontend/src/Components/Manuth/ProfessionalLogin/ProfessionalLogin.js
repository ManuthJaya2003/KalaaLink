import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '../../MainNav/MainNav';

function ProfessionalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch("http://localhost:5000/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // redirect based on role
      switch (data.employee.role.toLowerCase()) {
        case "admin":
          navigate("/admindashboard");
          break;
        case "artist manager":
          navigate("/artistManager");
          break;
        case "event manager":
          navigate("/eventmanagerdashboard");
          break;
        case "marketplace_manager":
          navigate("/marketplacemanagerdashboard");
          break;
        case "donation_manager":
          navigate("/donationmanagerdashboard");
          break;
        default:
          setError("Invalid role");
      }

      // Optionally, save employee info in localStorage
      localStorage.setItem("employee", JSON.stringify(data.employee));

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div>
      <MainNav />

      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
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
              <option value="artist manager">Artist Manager</option>
              <option value="event manager">Event Manager</option>
              <option value="marketplace manager">Marketplace Manager</option>
              <option value="donation manager">Donation Manager</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfessionalLogin;
