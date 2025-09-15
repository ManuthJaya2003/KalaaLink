const mongoose = require('mongoose');

// Get PartnershipRequest model safely
const getPartnershipRequestModel = () => {
  if (mongoose.models.PartnershipRequest) {
    return mongoose.models.PartnershipRequest;
  }
  return require("../Model/PartnershipRequest");
};

// Submit a new partnership request
const submitPartnershipRequest = async (req, res, next) => {
  const { 
    organizationName, 
    contactName, 
    contactEmail, 
    message,
    logo 
  } = req.body;
  
  // Validate required fields
  if (!organizationName || !contactName || !contactEmail || !message) {
    return res.status(400).json({ 
      message: 'Organization name, contact name, contact email, and message are required' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  let partnershipRequest;
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    partnershipRequest = new PartnershipRequest({ 
      organizationName,
      contactName,
      contactEmail,
      message,
      logo: logo || null
    });
    await partnershipRequest.save();
  } catch (err) {
    console.error('Error saving partnership request:', err);
    return res.status(500).json({ message: err.message });
  }
  
  if (!partnershipRequest) {
    return res.status(404).json({ message: "Unable to submit partnership request" });
  }
  
  return res.status(201).json({ 
    message: "Partnership request submitted successfully",
    partnershipRequest 
  });
};

// Get all partnership requests (Donation Manager only)
const getAllPartnershipRequests = async (req, res, next) => {
  let partnershipRequests;
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    partnershipRequests = await PartnershipRequest.find().sort({ createdAt: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching partnership requests" });
  }
  
  if (!partnershipRequests) {
    return res.status(404).json({ message: "Partnership requests not found" });
  }
  
  return res.status(200).json({ partnershipRequests });
};

// Get approved partnership requests (Public view)
const getApprovedPartnershipRequests = async (req, res, next) => {
  let partnershipRequests;
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    partnershipRequests = await PartnershipRequest.find({ status: 'Approved' }).sort({ createdAt: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching approved partnership requests" });
  }
  
  return res.status(200).json({ partnershipRequests });
};

// Get partnership request by ID
const getPartnershipRequestById = async (req, res, next) => {
  const id = req.params.id;
  let partnershipRequest;
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    partnershipRequest = await PartnershipRequest.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching partnership request" });
  }
  
  if (!partnershipRequest) {
    return res.status(404).json({ message: "Partnership request not found" });
  }
  
  return res.status(200).json({ partnershipRequest });
};

// Approve partnership request
const approvePartnershipRequest = async (req, res, next) => {
  const id = req.params.id;
  let partnershipRequest;
  
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    partnershipRequest = await PartnershipRequest.findByIdAndUpdate(
      id,
      { 
        status: 'Approved',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error approving partnership request" });
  }
  
  if (!partnershipRequest) {
    return res.status(404).json({ message: "Partnership request not found" });
  }
  
  return res.status(200).json({ 
    message: "Partnership request approved successfully",
    partnershipRequest 
  });
};

// Reject partnership request
const rejectPartnershipRequest = async (req, res, next) => {
  const id = req.params.id;
  let partnershipRequest;
  
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    partnershipRequest = await PartnershipRequest.findByIdAndUpdate(
      id,
      { 
        status: 'Rejected',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error rejecting partnership request" });
  }
  
  if (!partnershipRequest) {
    return res.status(404).json({ message: "Partnership request not found" });
  }
  
  return res.status(200).json({ 
    message: "Partnership request rejected successfully",
    partnershipRequest 
  });
};

// Delete partnership request
const deletePartnershipRequest = async (req, res, next) => {
  const id = req.params.id;
  let partnershipRequest;
  
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    partnershipRequest = await PartnershipRequest.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting partnership request" });
  }
  
  if (!partnershipRequest) {
    return res.status(404).json({ message: "Partnership request not found" });
  }
  
  return res.status(200).json({ 
    message: "Partnership request deleted successfully",
    partnershipRequest 
  });
};

// Get partnership request statistics
const getPartnershipStats = async (req, res, next) => {
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    const totalRequests = await PartnershipRequest.countDocuments();
    const pendingRequests = await PartnershipRequest.countDocuments({ status: 'Pending' });
    const approvedRequests = await PartnershipRequest.countDocuments({ status: 'Approved' });
    const rejectedRequests = await PartnershipRequest.countDocuments({ status: 'Rejected' });
    
    const stats = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests
    };
    
    return res.status(200).json({ stats });
  } catch (err) {
    console.error("Error fetching partnership statistics:", err);
    return res.status(500).json({ message: "Error fetching statistics", error: err.message });
  }
};

// Clear partnership requests by status
const clearPartnershipRequestsByStatus = async (req, res, next) => {
  const { status } = req.params;
  try {
    const PartnershipRequest = getPartnershipRequestModel();
    const result = await PartnershipRequest.deleteMany({ status: status });
    return res.status(200).json({ 
      message: `All ${status} partnership requests deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error(`Error clearing ${status} partnership requests:`, err);
    return res.status(500).json({ 
      message: `Error clearing ${status} partnership requests`, 
      error: err.message 
    });
  }
};

exports.submitPartnershipRequest = submitPartnershipRequest;
exports.getAllPartnershipRequests = getAllPartnershipRequests;
exports.getApprovedPartnershipRequests = getApprovedPartnershipRequests;
exports.getPartnershipRequestById = getPartnershipRequestById;
exports.approvePartnershipRequest = approvePartnershipRequest;
exports.rejectPartnershipRequest = rejectPartnershipRequest;
exports.deletePartnershipRequest = deletePartnershipRequest;
exports.clearPartnershipRequestsByStatus = clearPartnershipRequestsByStatus;
exports.getPartnershipStats = getPartnershipStats;
