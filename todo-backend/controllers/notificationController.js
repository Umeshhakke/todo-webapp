const Subscription = require('../models/Subscription');

// @desc    Save push subscription
// @route   POST /api/subscribe
// @access  Private
const saveSubscription = async (req, res) => {
    try {
        const { subscription } = req.body;

        // Check if subscription already exists for this user
        const existing = await Subscription.findOne({ user: req.user._id });
        if (existing) {
            // Update existing subscription
            existing.endpoint = subscription.endpoint;
            existing.keys = subscription.keys;
            await existing.save();
            return res.status(200).json({ message: 'Subscription updated successfully' });
        }

        // Create new subscription
        await Subscription.create({
            user: req.user._id,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
        });

        res.status(201).json({ message: 'Subscription saved successfully' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { saveSubscription };