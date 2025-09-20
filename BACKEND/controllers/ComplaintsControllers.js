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
    const { Name, Gmail, Message, Complaint_Category, resolved, rejected, status } = req.body;

    try {
        const updateData = {};
        
        // Only update fields that are provided
        if (Name !== undefined) updateData.Name = Name;
        if (Gmail !== undefined) updateData.Gmail = Gmail;
        if (Message !== undefined) updateData.Message = Message;
        if (Complaint_Category !== undefined) updateData.Complaint_Category = Complaint_Category;
        if (resolved !== undefined) updateData.resolved = resolved;
        if (rejected !== undefined) updateData.rejected = rejected;
        if (status !== undefined) {
            updateData.status = status;
            // Update resolved/rejected based on status
            if (status === 'Accepted') {
                updateData.resolved = true;
                updateData.rejected = false;
            } else if (status === 'Rejected') {
                updateData.resolved = false;
                updateData.rejected = true;
            } else if (status === 'Pending') {
                updateData.resolved = false;
                updateData.rejected = false;
            }
        }

        const complaints = await Complaints.findByIdAndUpdate(
            id,
            updateData,
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

// Bulk clear complaints by status
const bulkClearComplaints = async (req, res, next) => {
    const { status } = req.body;

    try {
        if (!status || !['Pending', 'Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'Pending', 'Accepted', or 'Rejected'" });
        }

        const result = await Complaints.deleteMany({ status: status });
        return res.status(200).json({ 
            message: `Successfully cleared ${result.deletedCount} ${status.toLowerCase()} complaints`,
            deletedCount: result.deletedCount
        });
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
    deleteComplaints,
    bulkClearComplaints
};
