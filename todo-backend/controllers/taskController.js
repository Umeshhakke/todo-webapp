const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (logged-in users only)
const createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;

        // Create task with the logged-in user's ID from the protect middleware
        const task = await Task.create({
            title,
            description,
            dueDate,
            priority,
            user: req.user._id, // <-- From protect middleware
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        // Find tasks where 'user' field matches the logged-in user's ID
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 }); // Newest first
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or unauthorized' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, completed } = req.body;

        // Find task and ensure it belongs to the logged-in user
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or unauthorized' });
        }

        // Update fields
        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
        task.priority = priority || task.priority;
        task.completed = completed !== undefined ? completed : task.completed;

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or unauthorized' });
        }

        await task.deleteOne();
        res.status(200).json({ message: 'Task removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
};