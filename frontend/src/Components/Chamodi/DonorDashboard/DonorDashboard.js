import React, { useState, useEffect } from 'react';
// ✅ Global navbar integration - reusing existing main navigation for consistency with Artists, Events, and Marketplace
import MainNav from '../../MainNav/MainNav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImpactStories from '../ImpactStories/ImpactStories';
import PartnershipForm from '../PartnershipForm/PartnershipForm';
import PartnersDisplay from '../PartnersDisplay/PartnersDisplay';
import './DonorDashboard.css';

function DonorDashboard() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    package: 'Bronze',
    amount: 25,
    customAmount: '',
  });
  const [packages, setPackages] = useState([]);
  const [showPartnershipForm, setShowPartnershipForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch packages
        const packagesResponse = await axios.get('http://localhost:5000/package');
        setPackages(packagesResponse.data.packages || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'package') {
      const selectedPackage = packages.find((pkg) => pkg.name === value);
      const newAmount = selectedPackage ? selectedPackage.amount : (value === 'Custom' ? (inputs.customAmount || 10) : 10);
      setInputs((prev) => ({
        ...prev,
        package: value,
        amount: newAmount,
        customAmount: value === 'Custom' ? prev.customAmount || 10 : '',
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: value,
        amount: name === 'customAmount' ? value : prev.amount,
      }));
    }
  };

  const handlePackageSelect = (pkg) => {
    setInputs((prev) => ({
      ...prev,
      package: pkg.name,
      amount: pkg.amount,
      packageId: pkg._id,
      customAmount: pkg.name === 'Custom' ? '' : prev.customAmount,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = inputs.package === 'Custom' ? Number(inputs.customAmount) : inputs.amount;
    if (finalAmount < 10) {
      alert('Minimum donation is LKR 10');
      return;
    }
    navigate('/donorpackagedetails', { state: { ...inputs, amount: finalAmount } });
  };

  return (
    <div>
      {/* ✅ Global navbar integration - ensures identical navbar styling, height, and design as Artists, Events, and Marketplace */}
      <MainNav />
      <div className="donor-dashboard-container">
        <div className="donor-dashboard-header">
          <h1>Make a Donation</h1>
          <p>Every donation, big or small, makes a significant impact.</p>
        </div>
      <div className="package-buttons">
        {packages.map((pkg) => (
          <button
            key={pkg._id}
            type="button"
            className={inputs.package === pkg.name ? 'selected' : ''}
            onClick={() => handlePackageSelect(pkg)}
          >
            {pkg.name} (LKR {pkg.amount?.toLocaleString()})
          </button>
        ))}
        <button
          type="button"
          className={inputs.package === 'Custom' ? 'selected' : ''}
          onClick={() => handlePackageSelect({ name: 'Custom', amount: '', _id: null })}
        >
          Custom
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="package">Choose a Package</label>
        <br />
        <select name="package" onChange={handleChange} value={inputs.package} required>
          {packages.map((pkg) => (
            <option key={pkg._id} value={pkg.name}>
              {pkg.name} (LKR {pkg.amount?.toLocaleString()})
            </option>
          ))}
          <option value="Custom">Custom</option>
        </select>
        <br />
        <br />
        {inputs.package === 'Custom' && (
          <>
            <label htmlFor="customAmount">Enter Custom Amount</label>
            <br />
            <input
              type="number"
              name="customAmount"
              onChange={handleChange}
              value={inputs.customAmount}
              min="10"
              required
            />
            <br />
            <br />
          </>
        )}
        <button type="submit">Proceed to Payment</button>
      </form>
      </div>
      
      {/* ✅ Impact Stories Section */}
      <ImpactStories />
      
      {/* ✅ Partners & Supporters Display */}
      <PartnersDisplay />
      
      {/* ✅ Become a Partner Section */}
      <div className="partnership-section">
        <div className="partnership-content">
          <h2>Become a Partner</h2>
          <p>Join us in making a difference. Partner with KalaaLink to support our mission and reach more people in need.</p>
          <button 
            className="partnership-button"
            onClick={() => setShowPartnershipForm(true)}
          >
            Request a Partnership
          </button>
        </div>
      </div>
      
      {/* ✅ Partnership Form Modal */}
      {showPartnershipForm && (
        <PartnershipForm 
          onClose={() => setShowPartnershipForm(false)}
          onSuccess={() => {
            setShowPartnershipForm(false);
            // Optionally refresh partners display
          }}
        />
      )}
    </div>
  );
}

export default DonorDashboard;