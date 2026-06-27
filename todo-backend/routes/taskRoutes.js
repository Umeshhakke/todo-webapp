const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // <-- Our JWT checker
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');

// Apply 'protect' middleware to ALL routes in this file
// This ensures every route below requires a valid JWT token
router.use(protect);

// Routes
router.route('/')
    .get(getTasks)      // GET /api/tasks
    .post(createTask);  // POST /api/tasks

router.route('/:id')
    .get(getTaskById)   // GET /api/tasks/:id
    .put(updateTask)    // PUT /api/tasks/:id
    .delete(deleteTask); // DELETE /api/tasks/:id

module.exports = router;