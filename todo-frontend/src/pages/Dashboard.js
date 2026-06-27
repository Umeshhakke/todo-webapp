import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newTime, setNewTime] = useState(''); 
    const [newPriority, setNewPriority] = useState('medium');
    const [error, setError] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch tasks');
            setLoading(false);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        let dueDateTime = null;
        if (newDueDate && newTime) {
            dueDateTime = new Date(`${newDueDate}T${newTime}:00`).toISOString();
        }

        try {
            const response = await api.post('/tasks', {
                title: newTitle,
                description: newDescription,
                dueDate: dueDateTime,
                priority: newPriority,
            });
            setTasks([response.data, ...tasks]);
            setNewTitle('');
            setNewDescription('');
            setNewDueDate('');
            setNewTime('');
            setNewPriority('medium');
            setError('');
        } catch (err) {
            setError('Failed to add task');
        }
    };

    const toggleComplete = async (taskId, currentStatus) => {
        try {
            const response = await api.put(`/tasks/${taskId}`, {
                completed: !currentStatus,
            });
            // ✅ FIXED: 'map' instead of 'mao'
            setTasks(tasks.map(task => task._id === taskId ? response.data : task));
        } catch (err) {
            setError('Failed to update task');
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(task => task._id !== taskId));
        } catch (err) {
            setError('Failed to delete task');
        }
    };

    const handleLogout = () => {
        logout();
    };

    // Get tasks due within the next 24 hours
    const getUpcomingTasks = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const due = new Date(task.dueDate);
            return due >= now && due <= tomorrow;
        });
    };
    const upcomingTasks = getUpcomingTasks();

    // Enable Notifications Logic
    const enableNotifications = async () => {
        try {
            if (!('Notification' in window)) {
                alert('This browser does not support notifications.');
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Permission denied. You will not receive notifications.');
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const vapidResponse = await api.get('/vapid-public-key');
            const vapidPublicKey = vapidResponse.data.publicKey;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            const response = await api.post('/subscribe', { subscription });
            if (response.status === 200 || response.status === 201) {
                setIsSubscribed(true);
                alert('🎉 Notifications enabled successfully! You will get reminders for upcoming tasks.');
            }
        } catch (error) {
            console.error('❌ Notification setup failed:', error);
            alert('Failed to enable notifications. See console for details.');
        }
    };

    // Helper function to convert VAPID key to Uint8Array
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    if (loading) return <div className="text-center mt-10 text-gray-600">Loading tasks...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={enableNotifications}
                            className={`px-4 py-2 rounded-lg transition ${
                                isSubscribed
                                    ? 'bg-green-500 text-white cursor-default'
                                    : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                            disabled={isSubscribed}
                        >
                            {isSubscribed ? '🔔 Notifications On' : '🔔 Enable Notifications'}
                        </button>
                        <span className="text-gray-600">👋 {user?.username}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Error message */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {/* ⏰ Upcoming Tasks Warning Banner (This shows tasks due in next 24 hours) */}
                {upcomingTasks.length > 0 && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded shadow-sm" role="alert">
                        <p className="font-bold">⏰ Reminder: {upcomingTasks.length} task{upcomingTasks.length > 1 ? 's are' : ' is'} due soon!</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                            {upcomingTasks.map(task => (
                                <li key={task._id}>
                                    <strong>{task.title}</strong> - Due: {new Date(task.dueDate).toLocaleString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Add Task Form */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <form onSubmit={addTask} className="space-y-3">
                        <div className="flex flex-col md:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Task title..."
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description (optional)"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <input
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                step="60"
                            />
                            <select
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Add Task
                            </button>
                        </div>
                    </form>
                </div>

                {/* Task List */}
                {tasks.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">No tasks yet. Add one above! 🎯</p>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div
                                key={task._id}
                                className={`bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                    task.completed ? 'bg-green-50 border-l-4 border-green-500' : ''
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleComplete(task._id, task.completed)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                            {task.title}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    {task.description && (
                                        <p className={`text-sm text-gray-600 mt-1 ml-8 ${task.completed ? 'line-through' : ''}`}>
                                            {task.description}
                                        </p>
                                    )}
                                    {task.dueDate && (
                                        <p className="text-xs text-gray-400 mt-1 ml-8">
                                            📅 Due: {new Date(task.dueDate).toLocaleString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteTask(task._id)}
                                    className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;