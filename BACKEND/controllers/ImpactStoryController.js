const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Get ImpactStory model safely
const getImpactStoryModel = () => {
  if (mongoose.models.ImpactStory) {
    return mongoose.models.ImpactStory;
  }
  return require('../model/ImpactStory');
};

// ✅ Get all impact stories (for public display)
const getAllImpactStories = async (req, res) => {
  try {
    const ImpactStory = getImpactStoryModel();
    const stories = await ImpactStory.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('title description coverImage createdAt');
    
    res.json({
      success: true,
      stories: stories
    });
  } catch (error) {
    console.error('Error fetching impact stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact stories',
      error: error.message
    });
  }
};

// ✅ Get all impact stories (for admin management)
const getAllImpactStoriesAdmin = async (req, res) => {
  try {
    const ImpactStory = getImpactStoryModel();
    const stories = await ImpactStory.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      stories: stories
    });
  } catch (error) {
    console.error('Error fetching impact stories for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact stories',
      error: error.message
    });
  }
};

// ✅ Get single impact story by ID
const getImpactStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid impact story ID'
      });
    }

    const ImpactStory = getImpactStoryModel();
    const story = await ImpactStory.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Impact story not found'
      });
    }

    res.json({
      success: true,
      story: story
    });
  } catch (error) {
    console.error('Error fetching impact story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact story',
      error: error.message
    });
  }
};

// ✅ Create new impact story
const createImpactStory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const coverImage = req.file;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Cover image is required'
      });
    }

    // Validate title length
    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }

    // Validate description length
    if (description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be less than 2000 characters'
      });
    }

    const ImpactStory = getImpactStoryModel();
    const newStory = new ImpactStory({
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage.filename
    });

    const savedStory = await newStory.save();

    res.status(201).json({
      success: true,
      message: 'Impact story created successfully',
      story: savedStory
    });
  } catch (error) {
    console.error('Error creating impact story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create impact story',
      error: error.message
    });
  }
};

// ✅ Update impact story
const updateImpactStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    const coverImage = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid impact story ID'
      });
    }

    const ImpactStory = getImpactStoryModel();
    const story = await ImpactStory.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Impact story not found'
      });
    }

    // Update fields
    if (title !== undefined) {
      if (title.length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Title must be less than 200 characters'
        });
      }
      story.title = title.trim();
    }

    if (description !== undefined) {
      if (description.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Description must be less than 2000 characters'
        });
      }
      story.description = description.trim();
    }

    if (isActive !== undefined) {
      story.isActive = isActive;
    }

    // Handle new cover image
    if (coverImage) {
      // Delete old image file
      const oldImagePath = path.join(__dirname, '../uploads', story.coverImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      story.coverImage = coverImage.filename;
    }

    story.updatedAt = new Date();
    const updatedStory = await story.save();

    res.json({
      success: true,
      message: 'Impact story updated successfully',
      story: updatedStory
    });
  } catch (error) {
    console.error('Error updating impact story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update impact story',
      error: error.message
    });
  }
};

// ✅ Delete impact story
const deleteImpactStory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid impact story ID'
      });
    }

    const ImpactStory = getImpactStoryModel();
    const story = await ImpactStory.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Impact story not found'
      });
    }

    // Delete associated image file
    const imagePath = path.join(__dirname, '../uploads', story.coverImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await ImpactStory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Impact story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting impact story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete impact story',
      error: error.message
    });
  }
};

// ✅ Toggle impact story active status
const toggleImpactStoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid impact story ID'
      });
    }

    const ImpactStory = getImpactStoryModel();
    const story = await ImpactStory.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Impact story not found'
      });
    }

    story.isActive = !story.isActive;
    story.updatedAt = new Date();
    const updatedStory = await story.save();

    res.json({
      success: true,
      message: `Impact story ${updatedStory.isActive ? 'activated' : 'deactivated'} successfully`,
      story: updatedStory
    });
  } catch (error) {
    console.error('Error toggling impact story status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle impact story status',
      error: error.message
    });
  }
};

module.exports = {
  getAllImpactStories,
  getAllImpactStoriesAdmin,
  getImpactStoryById,
  createImpactStory,
  updateImpactStory,
  deleteImpactStory,
  toggleImpactStoryStatus
};
