import React, { useState, useEffect } from 'react';
// ✅ Global navbar integration - reusing existing main navigation for consistency with Artists, Events, and Marketplace
import MainNav from '../../MainNav/MainNav';
import MainFooter from '../../MainFooter/MainFooter';
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
      
      {/* Donation Hero Video Section */}
      <div className="donation-hero-video">
        <video
          className="donation-background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/donationHeroVid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Support Our Talented Artists Section - Matching Events page styling */}
      <div className="donor-support-section">
        <div className="donor-support-text-section">
          <h2 className="donor-support-title">Support Our Talented Artists</h2>
          <p className="donor-support-subtitle">Help talented artists continue creating amazing work and bring their artistic visions to life</p>
        </div>
      </div>
      
      <div className="donor-dashboard-container">
        {/* Complimentary text before packages */}
        <div className="packages-intro">
          <p className="packages-intro-text">We offer a variety of packages for you to choose from to donate to our talented artists.</p>
        </div>

        {/* Donation Package Buttons */}
        <div className="package-buttons-container">
          <div className="package-buttons">
            {packages.map((pkg) => (
              <button
                key={pkg._id}
                type="button"
                className={`package-button ${pkg.name.toLowerCase()}-package ${inputs.package === pkg.name ? 'selected' : ''}`}
                onClick={() => handlePackageSelect(pkg)}
              >
                {pkg.name} (LKR {pkg.amount?.toLocaleString()})
              </button>
            ))}
            <button
              type="button"
              className={`package-button custom-package ${inputs.package === 'Custom' ? 'selected' : ''}`}
              onClick={() => handlePackageSelect({ name: 'Custom', amount: '', _id: null })}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Small note before form */}
        <div className="form-intro">
          <p className="form-intro-text">Every contribution makes an impact.</p>
        </div>

        {/* Choose Package Form */}
        <div className="donation-form-container">
          <form onSubmit={handleSubmit} className="donation-form">
            <label htmlFor="package">Choose a Package</label>
            <select name="package" onChange={handleChange} value={inputs.package} required>
              {packages.map((pkg) => (
                <option key={pkg._id} value={pkg.name}>
                  {pkg.name} (LKR {pkg.amount?.toLocaleString()})
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>
            
            {inputs.package === 'Custom' && (
              <div className="custom-amount-section">
                <label htmlFor="customAmount">Enter Custom Amount</label>
                <input
                  type="number"
                  name="customAmount"
                  onChange={handleChange}
                  value={inputs.customAmount}
                  min="10"
                  required
                />
              </div>
            )}
            
            <button type="submit" className="submit-button">Proceed to Payment</button>
          </form>
        </div>
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
      
      {/* ✅ Footer - matching exactly with artist/home/events pages */}
      <MainFooter />
    </div>
  );
}

export default DonorDashboard;