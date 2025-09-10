import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddPackages.css';

function AddPackages() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    name: '',
    amount: '',
    description: '',
    isActive: true,
  });

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
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
    sendRequest().then(() => history('/donation-manager-dashboard'));
  };

  const handleCancel = () => {
    setInputs({
      name: '',
      amount: '',
      description: '',
      isActive: true,
    });
  };

  const sendRequest = async () => {
    try {
      const response = await axios.post('http://localhost:5000/package', {
        name: String(inputs.name),
        amount: Number(inputs.amount),
        description: String(inputs.description || ''),
        isActive: Boolean(inputs.isActive),
      });
      return response.data;
    } catch (error) {
      console.error('Error adding package:', error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <div className="add-package-container">
      <h1>Add Package</h1>
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
        <label htmlFor="amount">Amount ($)</label>
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
          id="description"
          name="description"
          onChange={handleChange}
          value={inputs.description}
        ></textarea>
        <br />
        <br />
        <button type="submit">Add</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default AddPackages;