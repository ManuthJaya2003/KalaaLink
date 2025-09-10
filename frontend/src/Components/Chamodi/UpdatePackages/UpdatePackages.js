import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdatePackages.css';

function UpdatePackages() {
  const [inputs, setInputs] = useState({
    name: '',
    amount: '',
    description: '',
    isActive: true,
  });
  const history = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchHandler = async () => {
      await axios
        .get(`http://localhost:5000/package/${id}`)
        .then((res) => res.data)
        .then((data) => setInputs(data.package));
    };
    fetchHandler();
  }, [id]);

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancel = () => {
    // ✅ Redirect back to donation manager dashboard
    history('/donation-manager-dashboard');
  };

  const sendRequest = async () => {
    await axios.put(`http://localhost:5000/package/${id}`, {
      name: String(inputs.name),
      amount: Number(inputs.amount),
      description: String(inputs.description || ''),
      isActive: Boolean(inputs.isActive),
    }).then((res) => res.data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputs.name || !inputs.amount) {
      alert('Package name and amount are required');
      return;
    }
    if (Number(inputs.amount) < 10) {
      alert('Minimum amount is $10');
      return;
    }
    sendRequest().then(() => {
      alert('Package updated successfully!');
      history('/donation-manager-dashboard');
    });
  };

  return (
    <div className="update-package-container">
      <h1>Update Package</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Package Name</label>
        <br />
        <input
          type="text"
          name="name"
          onChange={handleChange}
          value={inputs.name}
          required
        />
        <br />
        <br />
        <label htmlFor="amount">Amount</label>
        <br />
        <input
          type="number"
          name="amount"
          onChange={handleChange}
          value={inputs.amount}
          min="10"
          required
        />
        <br />
        <br />
        <label htmlFor="description">Description</label>
        <br />
        <textarea
          name="description"
          onChange={handleChange}
          value={inputs.description || ''}
        ></textarea>
        <br />
        <br />
        <button type="submit">Update</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default UpdatePackages;