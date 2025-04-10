const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const mongodb = require('mongodb');
const Task = require('../models/task');


/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Title of the task
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *           default: pending
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           default: medium
 *         due_date:
 *           type: string
 *           format: date-time
 *         assigned_users:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs assigned to this task (optional)
 *         created_at:
 *           type: string
 *           format: date-time
 * 
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
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
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
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
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid task ID format
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 * 
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid input data or task ID
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Invalid task ID format
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 * 
 * /api/tasks/{id}/assign:
 *   post:
 *     summary: Assign users to a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userEmails
 *             properties:
 *               userEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *     responses:
 *       200:
 *         description: Users assigned successfully
 *       400:
 *         description: Invalid input data or task ID
 *       404:
 *         description: Task or users not found
 *       500:
 *         description: Server error
 * 
 * /api/tasks/{id}/assignees:
 *   get:
 *     summary: Get task assignees
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: List of task assignees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                 taskTitle:
 *                   type: string
 *                 assigneeCount:
 *                   type: integer
 *                 assignees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       assigned_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid task ID format
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */




const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const task = await Task.create({
            ...req.body,
            creator: req.user.id
        });
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const assignUserToTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { userId } = req.body;

        const task = await Task.findById(taskId);
        const user = await User.findById(userId);

        if (!task || !user) {
            return res.status(404).json({
                success: false,
                message: task ? 'User not found' : 'Task not found'
            });
        }

        // Check if user is already assigned
        if (task.assignedUsers && task.assignedUsers.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'User already assigned to this task'
            });
        }

        // Add user to task's assigned users
        task.assignedUsers = task.assignedUsers || [];
        task.assignedUsers.push(userId);
        await task.save();

        res.status(200).json({
            success: true,
            message: 'User assigned successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeUserFromTask = async (req, res) => {
    try {
        const { taskId, userId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Remove user from task's assigned users
        if (task.assignedUsers) {
            task.assignedUsers = task.assignedUsers.filter(id => id.toString() !== userId);
            await task.save();
        }

        res.status(200).json({
            success: true,
            message: 'User removed from task successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getTaskAssignments = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        const task = await Task.findById(taskId)
            .populate('assignedUsers', 'name email role')  // Only return these user fields
            .select('title description assignedUsers');
            
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                taskId: task._id,
                title: task.title,
                description: task.description,
                assignedUsers: task.assignedUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getTaskAssignees = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedUsers', 'name email')
            .select('assignedUsers');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task.assignedUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    assignUserToTask,
    removeUserFromTask,
    getTaskAssignees
};