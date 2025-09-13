const express = require('express');
const router = express.Router();
const ImpactStoryController = require('../controllers/ImpactStoryController');
const upload = require('../middleware/upload');

// ✅ Public routes (for frontend display)
router.get('/', ImpactStoryController.getAllImpactStories);
router.get('/:id', ImpactStoryController.getImpactStoryById);

// ✅ Admin routes (for donation manager dashboard)
router.get('/admin/all', ImpactStoryController.getAllImpactStoriesAdmin);
router.post('/admin/create', upload.single('coverImage'), ImpactStoryController.createImpactStory);
router.put('/admin/update/:id', upload.single('coverImage'), ImpactStoryController.updateImpactStory);
router.delete('/admin/delete/:id', ImpactStoryController.deleteImpactStory);
router.patch('/admin/toggle/:id', ImpactStoryController.toggleImpactStoryStatus);

module.exports = router;
