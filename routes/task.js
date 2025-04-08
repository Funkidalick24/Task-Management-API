const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
}= require('../controller/task');
const {isAuthenticated} = require('../middleware/auth');

// Public routes
router.get('/tasks',getTasks);
router.get('/tasks/:id', getTaskById);

// Protected routes
router.post('/tasks', isAuthenticated, createTask);
router.put('/tasks/:id', isAuthenticated, updateTask);
router.delete('/tasks/:id', isAuthenticated, deleteTask);

module.exports = router;