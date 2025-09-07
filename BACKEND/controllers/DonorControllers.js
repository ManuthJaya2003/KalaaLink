const Donor = require("../Model/DonorModel");

const getAllDonors = async (req, res, next) => {
  let donors;
  try {
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
  const { FirstName, LastName, PhoneNumber, Email, Address, Amount, DonorNote } = req.body;
  let donor;
  try {
    donor = new Donor({ FirstName, LastName, PhoneNumber, Email, Address, Amount, DonorNote });
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

exports.getAllDonors = getAllDonors;
exports.addDonors = addDonors;
exports.getById = getById;
exports.updateDonors = updateDonors;
exports.deleteDonors = deleteDonors;