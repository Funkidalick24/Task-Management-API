const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    assignUserToTask,
    removeUserFromTask,
    getTaskAssignments
} = require('../controller/task');
const { isAuthenticated } = require('../middleware/auth');


router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', isAuthenticated, createTask);
router.put('/tasks/:id', isAuthenticated, updateTask);
router.delete('/tasks/:id', isAuthenticated, deleteTask)
router.post('/tasks/:taskId/assign', isAuthenticated, assignUserToTask);
router.delete('/tasks/:taskId/users/:userId', isAuthenticated, removeUserFromTask);
router.get('/tasks/:id/users', isAuthenticated, getTaskAssignments);

module.exports = router;