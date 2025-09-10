const mongoose = require('mongoose');

// Get Donor model safely
const getDonorModel = () => {
  if (mongoose.models.Donor) {
    return mongoose.models.Donor;
  }
  return require("../Model/DonorModel");
};

const getAllDonors = async (req, res, next) => {
  let donors;
  try {
    const Donor = getDonorModel();
    donors = await Donor.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching donors" });
  }
  if (!donors) {
    return res.status(404).json({ message: "Donors not found" });
  }
  return res.status(200).json({ donors });
};

const addDonors = async (req, res, next) => {
  const { 
    FirstName, 
    LastName, 
    PhoneNumber, 
    Email, 
    Address, 
    Amount, 
    DonorNote,
    // ✅ Enhanced donation fields
    packageId,
    packageName,
    paymentStatus = 'pending',
    stripePaymentIntentId,
    stripeSessionId
  } = req.body;
  
  let donor;
  try {
    const Donor = getDonorModel();
    donor = new Donor({ 
      FirstName, 
      LastName, 
      PhoneNumber, 
      Email, 
      Address, 
      Amount, 
      DonorNote,
      packageId,
      packageName,
      paymentStatus,
      stripePaymentIntentId,
      stripeSessionId
    });
    await donor.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
  if (!donor) {
    return res.status(404).json({ message: "Unable to add donor" });
  }
  return res.status(200).json({ donor });
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  let donor;
  try {
    const Donor = getDonorModel();
    donor = await Donor.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching donor" });
  }
  if (!donor) {
    return res.status(404).json({ message: "Donor not found" });
  }
  return res.status(200).json({ donor });
};

const updateDonors = async (req, res, next) => {
  const id = req.params.id;
  const { FirstName, LastName, PhoneNumber, Email, Address, Amount, DonorNote } = req.body;
  let donor;
  try {
    const Donor = getDonorModel();
    donor = await Donor.findByIdAndUpdate(
      id,
      { FirstName, LastName, PhoneNumber, Email, Address, Amount, DonorNote },
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating donor" });
  }
  if (!donor) {
    return res.status(404).json({ message: "Unable to update donor details" });
  }
  return res.status(200).json({ donor });
};

const deleteDonors = async (req, res, next) => {
  const id = req.params.id;
  let donor;
  try {
    const Donor = getDonorModel();
    donor = await Donor.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting donor" });
  }
  if (!donor) {
    return res.status(404).json({ message: "Unable to delete donor details" });
  }
  return res.status(200).json({ donor });
};

// ✅ Enhanced donation controller methods

// Update payment status (for Stripe webhooks)
const updatePaymentStatus = async (req, res, next) => {
  const { donorId, paymentStatus, stripePaymentIntentId, stripeSessionId } = req.body;
  
  try {
    const updateData = { 
      paymentStatus,
      updatedAt: new Date()
    };
    
    if (paymentStatus === 'paid') {
      updateData.paymentDate = new Date();
    }
    
    if (stripePaymentIntentId) {
      updateData.stripePaymentIntentId = stripePaymentIntentId;
    }
    
    if (stripeSessionId) {
      updateData.stripeSessionId = stripeSessionId;
    }
    
    const Donor = getDonorModel();
    const donor = await Donor.findByIdAndUpdate(
      donorId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    
    return res.status(200).json({ donor });
  } catch (err) {
    console.error("Error updating payment status:", err);
    return res.status(500).json({ message: "Error updating payment status", error: err.message });
  }
};

// Get donations by payment status
const getDonationsByStatus = async (req, res, next) => {
  const { status } = req.params;
  
  try {
    const Donor = getDonorModel();
    const donations = await Donor.find({ paymentStatus: status }).sort({ createdAt: -1 });
    return res.status(200).json({ donations });
  } catch (err) {
    console.error("Error fetching donations by status:", err);
    return res.status(500).json({ message: "Error fetching donations", error: err.message });
  }
};

// Get donation analytics
const getDonationAnalytics = async (req, res, next) => {
  try {
    const Donor = getDonorModel();
    const totalDonations = await Donor.countDocuments();
    const paidDonations = await Donor.countDocuments({ paymentStatus: 'paid' });
    const pendingDonations = await Donor.countDocuments({ paymentStatus: 'pending' });
    
    const totalAmount = await Donor.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$Amount' } } }
    ]);
    
    const amountByPackage = await Donor.aggregate([
      { $match: { paymentStatus: 'paid', packageName: { $exists: true, $ne: null } } },
      { $group: { _id: '$packageName', total: { $sum: '$Amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    
    const analytics = {
      summary: {
        totalDonations,
        paidDonations,
        pendingDonations,
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0
      },
      amountByPackage
    };
    
    return res.status(200).json({ analytics });
  } catch (err) {
    console.error("Error fetching donation analytics:", err);
    return res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
};

// ✅ Bulk delete donations by status
const bulkDeleteDonationsByStatus = async (req, res, next) => {
  const { status } = req.params;
  
  console.log(`🔄 Bulk delete request received for status: ${status}`);
  
  try {
    if (!status || !['pending', 'paid'].includes(status)) {
      console.log(`❌ Invalid status: ${status}`);
      return res.status(400).json({ message: "Invalid status. Must be 'pending' or 'paid'" });
    }
    
    const Donor = getDonorModel();
    
    // Find donations with the specified status
    const donationsToDelete = await Donor.find({ paymentStatus: status });
    
    if (donationsToDelete.length === 0) {
      return res.status(404).json({ 
        message: `No ${status} donations found to delete`,
        deletedCount: 0
      });
    }
    
    // Delete all donations with the specified status
    const deleteResult = await Donor.deleteMany({ paymentStatus: status });
    
    console.log(`✅ Bulk deleted ${deleteResult.deletedCount} ${status} donations`);
    
    return res.status(200).json({
      message: `Successfully deleted ${deleteResult.deletedCount} ${status} donations`,
      deletedCount: deleteResult.deletedCount,
      status: status
    });
    
  } catch (err) {
    console.error("Error bulk deleting donations:", err);
    return res.status(500).json({ 
      message: "Error bulk deleting donations", 
      error: err.message 
    });
  }
};

exports.getAllDonors = getAllDonors;
exports.addDonors = addDonors;
exports.getById = getById;
exports.updateDonors = updateDonors;
exports.deleteDonors = deleteDonors;
exports.updatePaymentStatus = updatePaymentStatus;
exports.getDonationsByStatus = getDonationsByStatus;
exports.getDonationAnalytics = getDonationAnalytics;
exports.bulkDeleteDonationsByStatus = bulkDeleteDonationsByStatus;