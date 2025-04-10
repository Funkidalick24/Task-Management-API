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
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { userEmails } = req.body;
        if (!Array.isArray(userEmails) || userEmails.length === 0) {
            return res.status(400).json({
                message: 'User emails array is required'
            });
        }
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const task = await db.collection('tasks').findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const users = await db.collection('users')
            .find({ email: { $in: userEmails } })
            .toArray();
        if (users.length !== userEmails.length) {
            return res.status(400).json({
                message: 'One or more users not found',
                foundUsers: users.map(u => u.email),
                missingUsers: userEmails.filter(email => 
                    !users.find(u => u.email === email)
                )
            });
        }
        const userIds = users.map(user => user._id);
        const assignments = userIds.map(userId => ({
            task_id: taskId,
            user_id: userId,
            assigned_at: new Date()
        }));
        await db.collection('task_assignments').insertMany(assignments);
        await db.collection('tasks').updateOne(
            { _id: taskId },
            { $addToSet: { assigned_users: { $each: userIds } } }
        );
        await db.collection('users').updateMany(
            { _id: { $in: userIds } },
            { $addToSet: { assigned_tasks: taskId } }
        );
        res.status(200).json({
            message: 'Users assigned to task successfully',
            assignedUsers: users.map(u => ({
                email: u.email,
                name: u.name
            }))
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error assigning users to task',
            error: err.message
        });
    } finally {
        if (client) await client.close();
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
    getTaskAssignees
};