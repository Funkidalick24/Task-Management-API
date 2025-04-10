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
    getTaskAssignees
} = require('../controller/task');
const { isAuthenticated } = require('../middleware/auth');

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of all tasks
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - githubAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized
 * 
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - githubAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - githubAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 * 
 * /api/tasks/{taskId}/assign:
 *   post:
 *     summary: Assign users to task
 *     tags: [Tasks]
 *     security:
 *       - githubAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users assigned successfully
 *       401:
 *         description: Unauthorized
 * 
 * /api/tasks/{taskId}/users/{userId}:
 *   delete:
 *     summary: Remove user from task
 *     tags: [Tasks]
 *     security:
 *       - githubAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User removed successfully
 *       401:
 *         description: Unauthorized
 * 
 * /api/tasks/{id}/users:
 *   get:
 *     summary: Get task assignments
 *     tags: [Tasks]
 *     security:
 *       - githubAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assigned users
 *       401:
 *         description: Unauthorized
 * 
 * /api/tasks/{id}/users:
 *   get:
 *     summary: Get task assignees
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users assigned to the task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       404:
 *         description: Task not found
 */

router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', isAuthenticated, createTask);
router.put('/tasks/:id', isAuthenticated, updateTask);
router.delete('/tasks/:id', isAuthenticated, deleteTask);
router.post('/tasks/:taskId/assign', isAuthenticated, assignUserToTask);
router.delete('/tasks/:taskId/users/:userId', isAuthenticated, removeUserFromTask);
router.get('/tasks/:id/users', isAuthenticated, getTaskAssignees);

module.exports = router;