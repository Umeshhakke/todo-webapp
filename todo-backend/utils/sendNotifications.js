const webpush = require('web-push');
const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Subscription = require('../models/Subscription');

// Configure VAPID keys (from .env)
webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// Function to send a notification to a specific user
const sendPushNotification = async (subscription, title, body) => {
    try {
        const payload = JSON.stringify({ title, body });
        await webpush.sendNotification(subscription, payload);
        console.log(`✅ Notification sent to ${subscription.endpoint}`);
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        // If subscription is invalid (expired), delete it from DB
        if (error.statusCode === 410) {
            await Subscription.findOneAndDelete({ endpoint: subscription.endpoint });
            console.log('🗑️ Expired subscription removed.');
        }
    }
};

// The cron job: runs every minute
const startCronJob = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const oneHourLater = new Date(now);
            oneHourLater.setHours(oneHourLater.getHours() + 1);

            // 🔥 DEBUG: Print current time
            console.log(`⏰ Checking tasks at: ${now.toISOString()}`);
            console.log(`📅 Looking for tasks between: ${now.toISOString()} and ${oneHourLater.toISOString()}`);

            // Find tasks due within the next hour
            const upcomingTasks = await Task.find({
                dueDate: { $gte: now, $lte: oneHourLater },
                completed: false,
            }).populate('user');

            if (upcomingTasks.length === 0) {
                // 🔥 DEBUG: Show the latest task's dueDate to see if it's in range
                const latestTask = await Task.findOne({ completed: false }).sort({ dueDate: -1 });
                if (latestTask) {
                    console.log(`⚠️ Latest task due date: ${latestTask.dueDate}`);
                } else {
                    console.log('📭 No pending tasks found at all.');
                }
                return;
            }

            console.log(`✅ Found ${upcomingTasks.length} upcoming task(s)!`);

            // Group tasks by user
            const tasksByUser = {};
            upcomingTasks.forEach((task) => {
                const userId = task.user._id.toString();
                if (!tasksByUser[userId]) {
                    tasksByUser[userId] = { user: task.user, tasks: [] };
                }
                tasksByUser[userId].tasks.push(task);
            });

            // For each user, send a notification
            for (const userId in tasksByUser) {
                const { user, tasks } = tasksByUser[userId];
                
                // 🔥 DEBUG: Check if subscription exists
                const subscription = await Subscription.findOne({ user: userId });
                if (!subscription) {
                    console.log(`🔕 User ${user.username} (${userId}) has no push subscription.`);
                    continue;
                }
                console.log(`🔔 Sending notification to ${user.username}...`);

                const taskTitles = tasks.map((t) => `"${t.title}"`).join(', ');
                const message = `⏰ You have ${tasks.length} task(s) due soon: ${taskTitles}`;

                await sendPushNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.keys.p256dh,
                            auth: subscription.keys.auth,
                        },
                    },
                    '📋 Task Reminder!',
                    message
                );
            }
        } catch (error) {
            console.error('❌ Cron job error:', error);
        }
    });
};

module.exports = { startCronJob };