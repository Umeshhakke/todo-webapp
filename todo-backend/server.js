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