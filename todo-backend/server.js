const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes'); 
const notificationRoutes = require('./routes/notificationRoutes'); // <-- ADD THIS LINE
const { startCronJob } = require('./utils/sendNotifications');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subscribe', notificationRoutes); // <-- ADD THIS LINE

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working perfectly!' });
});
// Expose VAPID public key to frontend
app.get('/api/vapid-public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});
// 🧪 TEST ROUTE: Manually trigger a notification for the logged-in user
app.get('/api/test-notification', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });

        const subscription = await Subscription.findOne({ user: user._id });
        if (!subscription) {
            return res.status(404).json({ message: 'No subscription found for this user' });
        }

        const webpush = require('web-push');
        webpush.setVapidDetails(
            `mailto:${process.env.VAPID_EMAIL}`,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
            },
            JSON.stringify({ title: '🧪 Test Notification', body: 'If you see this, push works!' })
        );

        res.json({ message: 'Test notification sent!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' MongoDB Connected Successfully!');
    } catch (error) {
        console.error(' MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
});