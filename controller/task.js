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
    let client;
    try {
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const tasks = await db.collection('tasks').find().toArray();
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching tasks',
            error: err.message 
        });
    } finally {
        if (client) await client.close();
    }
};

const getTaskById = async (req, res) => {
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const task = await db.collection('tasks').findOne({ _id: taskId });
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching task',
            error: err.message
        });
    } finally {
        if (client) await client.close();
    }
};

const createTask = async (req, res) => {
    let client;
    try {
        const { title, description, priority = 'medium', status = 'pending' } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        const task = {
            title,
            description,
            status,
            priority,
            created_by: req.user?.id,
            created_at: new Date(),
            assigned_users: []
        };

        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const result = await db.collection('tasks').insertOne(task);
        
        res.status(201).json({
            success: true,
            data: {
                _id: result.insertedId,
                ...task
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: err.message
        });
    } finally {
        if (client) await client.close();
    }
};

const updateTask = async (req, res) => {
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const updateData = { ...req.body, updated_at: new Date() };
        delete updateData._id;

        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const result = await db.collection('tasks').findOneAndUpdate(
            { _id: taskId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.value
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: err.message
        });
    } finally {
        if (client) await client.close();
    }
};

const deleteTask = async (req, res) => {
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const result = await db.collection('tasks').findOneAndDelete({ _id: taskId });

        if (!result.value) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.value
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: err.message
        });
    } finally {
        if (client) await client.close();
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
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        const task = await db.collection('tasks').findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const assignees = await db.collection('task_assignments')
            .aggregate([
                { $match: { task_id: taskId } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        _id: 0,
                        userId: '$user._id',
                        name: '$user.name',
                        email: '$user.email',
                        assigned_at: 1
                    }
                }
            ]).toArray();

        res.status(200).json({
            success: true,
            data: {
                taskId: taskId.toString(),
                taskTitle: task.title,
                assigneeCount: assignees.length,
                assignees
            }
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching task assignees',
            error: err.message
        });
    } finally {
        if (client) await client.close();
    }
};

const removeUserFromTask = async (req, res) => {
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.taskId);
        const { email } = req.params;  // Changed from userId to email

        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // First check if task exists
        const task = await db.collection('tasks').findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Find user by email
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove the assignment
        const result = await db.collection('task_assignments').deleteOne({
            task_id: taskId,
            user_id: user._id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User is not assigned to this task'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User removed from task successfully',
            data: {
                taskId: taskId.toString(),
                userEmail: email
            }
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error removing user from task',
            error: err.message
        });
    } finally {
        if (client) await client.close();
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    assignUserToTask,
    getTaskAssignees,
    removeUserFromTask  // Add this export
};