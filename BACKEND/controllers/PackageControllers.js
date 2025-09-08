
const Package = require("../Model/PackageModel");

const getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.find();
    if (!packages || packages.length === 0) {
      return res.status(404).json({ message: "No packages found" });
    }
    return res.status(200).json({ packages });
  } catch (err) {
    console.error("Error fetching packages:", err);
    return res.status(500).json({ message: "Error fetching packages", error: err.message });
  }
};

const addPackage = async (req, res, next) => {
  const { name, amount, description, isActive } = req.body;
  try {
    if (!name || !amount) {
      return res.status(400).json({ message: "Name and amount are required" });
    }
    if (amount < 10) {
      return res.status(400).json({ message: "Amount must be at least LKR 10" });
    }
    const package = new Package({ name, amount, description, isActive });
    await package.save();
    return res.status(201).json({ package });
  } catch (err) {
    console.error("Error adding package:", err);
    return res.status(500).json({ message: "Error adding package", error: err.message });
  }
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const package = await Package.findById(id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    return res.status(200).json({ package });
  } catch (err) {
    console.error("Error fetching package:", err);
    return res.status(500).json({ message: "Error fetching package", error: err.message });
  }
};

const updatePackage = async (req, res, next) => {
  const id = req.params.id;
  const { name, amount, description, isActive } = req.body;
  try {
    if (!name || !amount) {
      return res.status(400).json({ message: "Name and amount are required" });
    }
    if (amount < 10) {
      return res.status(400).json({ message: "Amount must be at least LKR 10" });
    }
    const package = await Package.findByIdAndUpdate(
      id,
      { name, amount, description, isActive },
      { new: true, runValidators: true }
    );
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    return res.status(200).json({ package });
  } catch (err) {
    console.error("Error updating package:", err);
    return res.status(500).json({ message: "Error updating package", error: err.message });
  }
};

const deletePackage = async (req, res, next) => {
  const id = req.params.id;
  try {
    const package = await Package.findByIdAndDelete(id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    return res.status(200).json({ message: "Package deleted successfully" });
  } catch (err) {
    console.error("Error deleting package:", err);
    return res.status(500).json({ message: "Error deleting package", error: err.message });
  }
};

exports.getAllPackages = getAllPackages;
exports.addPackage = addPackage;
exports.getById = getById;
exports.updatePackage = updatePackage;
exports.deletePackage = deletePackage;
