const mongoose = require('mongoose');
const Customization = require('../model/Customization');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to parse color palette
const parseColorPalette = (palette) => {
  if (!palette) return [];
  
  if (Array.isArray(palette)) {
    return palette;
  }
  
  if (typeof palette === 'string') {
    try {
      // Try to parse as JSON
      return JSON.parse(palette);
    } catch (error) {
      // If it's not JSON, split by commas or spaces
      return palette.split(/[, ]+/).filter(color => color.trim() !== '');
    }
  }
  
  return [];
};

/**
 * @desc    Create a new customization request
 * @route   POST /api/customizations
 * @access  Public
 */
const createCustomization = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      description,
      preferredSize,
      preferredArtistName,
      preferredColorPalette,
      preferredArtType,
      budget,
      additionalNotes
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !description) {
      return res.status(400).json({ 
        success: false,
        error: 'Customer name, email, and description are required fields' 
      });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    const customization = new Customization({
      customerName,
      customerEmail,
      description,
      preferredSize,
      preferredArtistName,
      preferredColorPalette: parseColorPalette(preferredColorPalette),
      preferredArtType,
      budget: Number(budget) || 0,
      additionalNotes
    });

    const savedCustomization = await customization.save();
    
    res.status(201).json({
      success: true,
      data: savedCustomization
    });

  } catch (error) {
    console.error('Error creating customization:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing your request'
    });
  }
};

/**
 * @desc    Get all customization requests
 * @route   GET /api/customizations
 * @access  Public
 */
const getAllCustomizations = async (req, res) => {
  try {
    // Add pagination if needed
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customizations = await Customization.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Customization.countDocuments();

    res.json({
      success: true,
      count: customizations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: customizations
    });

  } catch (error) {
    console.error('Error fetching customizations:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching requests'
    });
  }
};

/**
 * @desc    Get single customization request by ID
 * @route   GET /api/customizations/:id
 * @access  Public
 */
const getCustomizationById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    const customization = await Customization.findById(req.params.id);

    if (!customization) {
      return res.status(404).json({
        success: false,
        error: 'Customization request not found'
      });
    }

    res.json({
      success: true,
      data: customization
    });

  } catch (error) {
    console.error('Error fetching customization:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching request'
    });
  }
};

/**
 * @desc    Update a customization request
 * @route   PUT /api/customizations/:id
 * @access  Public
 */
const updateCustomization = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    const updates = req.body;

    // Handle color palette conversion
    if (updates.preferredColorPalette) {
      updates.preferredColorPalette = parseColorPalette(updates.preferredColorPalette);
    }

    // Handle budget conversion
    if (updates.budget) {
      updates.budget = Number(updates.budget);
    }

    const customization = await Customization.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!customization) {
      return res.status(404).json({
        success: false,
        error: 'Customization request not found'
      });
    }

    res.json({
      success: true,
      data: customization
    });

  } catch (error) {
    console.error('Error updating customization:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating request'
    });
  }
};

/**
 * @desc    Delete a customization request
 * @route   DELETE /api/customizations/:id
 * @access  Public
 */
const deleteCustomization = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    const customization = await Customization.findByIdAndDelete(req.params.id);

    if (!customization) {
      return res.status(400).json({
        success: false,
        error: 'Customization request not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: req.params.id,
        message: 'Customization request deleted successfully'
      }
    });

  } catch (error) {
    console.error('Error deleting customization:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting request'
    });
  }
};

/**
 * @desc    Generate a PDF report for customization requests
 * @route   GET /api/customizations/report/download or GET /api/customizations/:id/report
 * @access  Public
 */
const generateCustomizationReport = async (req, res) => {
  try {
    const customizationId = req.params.id;
    let customizations;

    if (customizationId) {
      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(customizationId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID format'
        });
      }

      // Fetch single customization
      const customization = await Customization.findById(customizationId);
      if (!customization) {
        return res.status(404).json({
          success: false,
          error: 'Customization request not found'
        });
      }
      customizations = [customization];
    } else {
      // Fetch all customizations
      customizations = await Customization.find().sort({ createdAt: -1 });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="customization_report${customizationId ? `-${customizationId}` : ''}.pdf"`
    );

    const doc = new PDFDocument();
    const fontPath = path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf');
    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
    } else {
      console.warn('Roboto-Regular.ttf not found, using default font');
    }
    doc.pipe(res);

    // Report Header
    doc.fontSize(18).text('Customization Request Report', { align: 'center' });
    doc.moveDown();

    customizations.forEach((item, index) => {
      if (index > 0) doc.addPage();
      doc.fontSize(14).text(`Request ${index + 1}: ${item.customerName || 'Unknown Customer'}`, { align: 'center' });
      doc.moveDown(0.5);

      // Customer Information
      doc.fontSize(12).text('Customer Information:', { underline: true });
      doc.fontSize(10).text(`Name: ${item.customerName || 'N/A'}`);
      doc.text(`Email: ${item.customerEmail || 'N/A'}`);
      doc.text(`Submitted: ${item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : 'N/A'}`);
      doc.text(`Status: ${item.status || 'Pending'}`);
      doc.moveDown();

      // Project Description
      doc.fontSize(12).text('Project Description:', { underline: true });
      doc.fontSize(10).text(item.description || 'No description provided');
      doc.moveDown();

      // Preferences
      doc.fontSize(12).text('Preferences:', { underline: true });
      doc.fontSize(10);
      if (item.preferredSize) doc.text(`Size: ${item.preferredSize}`);
      if (item.preferredArtType) doc.text(`Art Type: ${item.preferredArtType}`);
      if (item.preferredArtistName) doc.text(`Artist Name: ${item.preferredArtistName}`);
      if (item.budget) doc.text(`Budget: Rs.${item.budget}`);
      if (item.preferredColorPalette?.length > 0) {
        doc.text(`Color Palette: ${item.preferredColorPalette.join(', ')}`);
      }
      if (item.additionalNotes) {
        doc.moveDown();
        doc.fontSize(12).text('Additional Notes:', { underline: true });
        doc.fontSize(10).text(item.additionalNotes);
      }

      doc.moveDown();
      doc.fontSize(8).text(`Request ID: ${item._id}`, { align: 'center' });
    });

    doc.end();
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
};

module.exports = {
  createCustomization,
  getAllCustomizations,
  getCustomizationById,
  updateCustomization,
  deleteCustomization,
  generateCustomizationReport
};