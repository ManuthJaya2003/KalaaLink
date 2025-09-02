const Complaints = require("../model/ComplaintsModel");

// Data Display
const getAllComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaints.find();
        if (!complaints) return res.status(404).json({ message: "Complaints not found" });
        return res.status(200).json({ complaints });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Data Insert
const addComplaints = async (req, res, next) => {
    const { Name, Gmail, Message, Complaint_Category } = req.body;

    try {
        const complaints = new Complaints({ Name, Gmail, Message, Complaint_Category });
        await complaints.save();
        return res.status(200).json({ complaints });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to add complaints" });
    }
};

// Get By Id
const getById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const complaints = await Complaints.findById(id);
        if (!complaints) return res.status(404).json({ message: "Complaints Not Found" });
        return res.status(200).json({ complaints });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Update complaints details
const updateComplaints = async (req, res, next) => {
    const id = req.params.id;
    const { Name, Gmail, Message, Complaint_Category } = req.body;

    try {
        const complaints = await Complaints.findByIdAndUpdate(
            id,
            { Name, Gmail, Message, Complaint_Category },
            { new: true } // returns the updated document
        );

        if (!complaints) return res.status(404).json({ message: "Unable to Update Complaints Details" });
        return res.status(200).json({ complaints });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Delete Complaints
const deleteComplaints = async (req, res, next) => {
    const id = req.params.id;

    try {
        const complaints = await Complaints.findByIdAndDelete(id);
        if (!complaints) return res.status(404).json({ message: "Unable to Delete Complaints details" });
        return res.status(200).json({ complaints });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getAllComplaints,
    addComplaints,
    getById,
    updateComplaints,
    deleteComplaints
};
