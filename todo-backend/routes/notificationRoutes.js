const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { saveSubscription } = require('../controllers/notificationController');

// Protect this route (only logged-in users can subscribe)
router.post('/', protect, saveSubscription);

module.exports = router;