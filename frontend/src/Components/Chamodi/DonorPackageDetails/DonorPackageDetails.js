import React, { useState, useEffect } from "react";
// ✅ Main navbar integration - using main project navigation for consistency
import MainNav from "../../MainNav/MainNav";
import AuthFooter from "../../Common/AuthFooter";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import "./DonorPackageDetails.css";

// ✅ Load Stripe with proper validation and error handling
const getStripeKey = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  console.log('🔍 Environment variable check:', {
    key: key,
    type: typeof key,
    startsWithPk: key?.startsWith('pk_'),
    hasKey: !!key
  });
  
  if (!key || typeof key !== 'string' || !key.startsWith('pk_')) {
    console.warn('⚠️ Invalid or missing Stripe publishable key, using fallback');
    return "pk_test_51S0seYQYjln4LvLSFGP8SdRgTWB4n8qbfx75KgLB5Uquv6kaAlpuMOyEouy92c4VaFlBT7cq9gOmLAVi44L7oUqf00tQzSJKGz";
  }
  return key;
};

// ✅ Safe Stripe loading with error handling
let stripePromise;
try {
  stripePromise = loadStripe(getStripeKey());
} catch (error) {
  console.error('❌ Failed to load Stripe:', error);
  stripePromise = Promise.reject(new Error('Failed to initialize Stripe'));
}

function DonorPackageDetails() {
  const { state } = useLocation();
  const history = useNavigate();

  const [inputs, setInputs] = useState({
    FirstName: "",
    LastName: "",
    PhoneNumber: "",
    Email: "",
    Address: "",
    Amount: state?.amount || 167,
    DonorNote: "",
  });

  // ✅ Load data from state if passed
  useEffect(() => {
    if (state) {
      setInputs((prev) => ({ ...prev, ...state }));
    }
  }, [state]);

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancel = () => {
    history("/donordashboard");
  };

  // ✅ Confirm donation and create Stripe payment session
  const handleConfirm = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!inputs.FirstName || !inputs.LastName || !inputs.Email || !inputs.PhoneNumber || !inputs.Address || !inputs.Amount) {
      alert('Please fill in all required fields');
      return;
    }

    if (inputs.Amount < 10) {
      alert('Minimum donation amount is LKR 10');
      return;
    }

    // Check if amount meets Stripe's minimum requirement
    const usdAmount = inputs.Amount * 0.003;
    if (usdAmount < 0.50) {
      const minAmount = Math.ceil(0.50 / 0.003);
      alert(`Minimum donation amount is LKR ${minAmount} to meet payment processor requirements`);
      return;
    }

    try {
      // ✅ Create Stripe payment session first
      const response = await axios.post('http://localhost:5000/api/donations/create-session', {
        firstName: inputs.FirstName,
        lastName: inputs.LastName,
        email: inputs.Email,
        phoneNumber: inputs.PhoneNumber,
        address: inputs.Address,
        amount: inputs.Amount,
        donorNote: inputs.DonorNote,
        packageId: state?.packageId,
        packageName: state?.package || 'Custom'
      });

      // ✅ Check if session was created successfully
      if (response.data.url && response.data.sessionId) {
        // ✅ Use direct URL redirect to avoid Stripe localization issues
        console.log('🔄 Redirecting to Stripe checkout:', response.data.url);
        window.location.href = response.data.url;
      } else {
        alert('Error creating payment session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      if (error.response?.status === 401) {
        alert('Payment system configuration error. Please contact support.');
      } else if (error.message.includes('Stripe')) {
        alert('Payment system error. Please try again later.');
      } else {
        alert('Error processing donation. Please try again.');
      }
    }
  };

  // ✅ Delete donor
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this donor?")) {
      await axios
        .delete(`http://localhost:5000/donor/${inputs.Email}`) // Assuming Email is unique
        .then(() => {
          alert("Donor deleted successfully!");
          history("/donordashboard");
        })
        .catch((err) => {
          console.error(err);
          alert("Error deleting donor.");
        });
    }
  };

  // ✅ Update donor
  const handleUpdate = async () => {
    await axios
      .put(`http://localhost:5000/donor/${inputs.Email}`, {
        FirstName: String(inputs.FirstName),
        LastName: String(inputs.LastName),
        PhoneNumber: String(inputs.PhoneNumber),
        Email: String(inputs.Email),
        Address: String(inputs.Address),
        Amount: Number(inputs.Amount),
        DonorNote: String(inputs.DonorNote || ""),
      })
      .then(() => alert("Donor details updated!"))
      .catch((err) => {
        console.error(err);
        alert("Error updating donor.");
      });
  };

  return (
    <div>
      {/* ✅ Main navbar integration - ensures consistent navigation across all subsystems */}
      <MainNav />
      <div className="donor-package-details-container">
        <div className="donor-details-text-section">
          <h1 className="donor-details-title">Donor Details</h1>
          <p className="donor-details-subtitle">Complete your donation information to support our mission</p>
        </div>

      <form onSubmit={handleConfirm}>
        <label htmlFor="FirstName">First Name</label>
        <input
          type="text"
          name="FirstName"
          onChange={handleChange}
          value={inputs.FirstName}
          required
        />

        <label htmlFor="LastName">Last Name</label>
        <input
          type="text"
          name="LastName"
          onChange={handleChange}
          value={inputs.LastName}
          required
        />

        <label htmlFor="PhoneNumber">Phone Number</label>
        <input
          type="tel"
          name="PhoneNumber"
          onChange={handleChange}
          value={inputs.PhoneNumber}
          required
        />

        <label htmlFor="Email">Email</label>
        <input
          type="email"
          name="Email"
          onChange={handleChange}
          value={inputs.Email}
          required
        />

        <label htmlFor="Address">Address</label>
        <textarea
          name="Address"
          onChange={handleChange}
          value={inputs.Address}
          required
        ></textarea>

        <label htmlFor="Amount">Amount</label>
        <input
          type="number"
          name="Amount"
          onChange={handleChange}
          value={inputs.Amount}
          min="167"
          required
        />

        <label htmlFor="DonorNote">Donor Note</label>
        <textarea
          name="DonorNote"
          onChange={handleChange}
          value={inputs.DonorNote}
        ></textarea>

        {/* Buttons */}
        <div className="button-container">
          <div className="primary-buttons">
            <button type="button" id="cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit">Confirm Donation</button>
          </div>
          <div className="secondary-buttons">
            <button type="button" onClick={handleUpdate}>
              Update Donor
            </button>
            <button type="button" onClick={handleDelete}>
              Delete Donor
            </button>
          </div>
        </div>
      </form>
      </div>
      <AuthFooter />
    </div>
  );
}

export default DonorPackageDetails;
