import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// ✅ Function to register the Push Service Worker
const registerPushServiceWorker = async () => {
    try {
        if ('serviceWorker' in navigator) {
            // Register our custom push-sw.js from the public folder
            const registration = await navigator.serviceWorker.register('/push-sw.js');
            console.log('✅ Push Service Worker registered:', registration);
            return registration;
        } else {
            console.warn('❌ Service Workers not supported in this browser.');
            return null;
        }
    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        return null;
    }
};

// Start the app
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Register the push service worker after the app loads
registerPushServiceWorker();