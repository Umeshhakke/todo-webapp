// This service worker handles PUSH events
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
        icon: '/logo192.png', // Make sure you have a logo in public/
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

// Handle notification click (opens the app)
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(clients.openWindow('/'));
    } else {
        event.waitUntil(clients.openWindow('/'));
    }
});