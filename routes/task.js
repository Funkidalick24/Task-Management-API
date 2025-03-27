const express = require('express');
const router = express.Router();
const taskController = require('../controller/task');

// Basic CRUD routes
router.get('/tasks', taskController.getTasks);
router.get('/tasks/:id', taskController.getTask);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

// Task assignment routes
router.post('/tasks/:id/assign', taskController.assignUsersToTask);
router.get('/tasks/:id/assignees', taskController.getTaskAssignees);

module.exports = router;