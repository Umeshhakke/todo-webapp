// ✅ Force the service worker to install and activate immediately
self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting()); // Skip the waiting phase
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim()); // Take control of all open tabs
});

// Your existing Push event listener
self.addEventListener('push', function (event) {
    console.log('📨 Push event received:', event);

    let data = { title: 'Task Reminder', body: 'You have a task due soon!' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/logo192.png',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [
            {
                action: 'open',
                title: '📋 Open App',
            },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(clients.openWindow('/'));
    } else {
        event.waitUntil(clients.openWindow('/'));
    }
});