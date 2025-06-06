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
 
 */




const getTasks = async (req, res) => {
    let client;
    try {
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const tasks = await db.collection('tasks')
            .find()
            .project({
                title: 1,
                description: 1,
                status: 1,
                priority: 1,
                created_at: 1,
                updated_at: 1,
                assigned_users: 1
            })
            .toArray();

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks.map(task => ({
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                created_at: task.created_at,
                updated_at: task.updated_at,
                assigned_users: task.assigned_users || []
            }))
        });
    } catch (err) {
        console.error('getTasks error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching tasks'
        });
    } finally {
        if (client) await client.close();
    }
};

const getTaskById = async (req, res) => {
    let client;
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId format
        if (!mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }

        const taskId = new mongodb.ObjectId(id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        
        const task = await db.collection('tasks').findOne(
            { _id: taskId },
            {
                projection: {
                    title: 1,
                    description: 1,
                    status: 1,
                    priority: 1,
                    created_at: 1,
                    updated_at: 1,
                    assigned_users: 1
                }
            }
        );
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                created_at: task.created_at,
                updated_at: task.updated_at,
                assigned_users: task.assigned_users || []
            }
        });
    } catch (err) {
        console.error('getTaskById error:', err);
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
        
        if (!title?.trim() || !description?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        const taskData = {
            title: title.trim(),
            description: description.trim(),
            status: ['pending', 'in-progress', 'completed'].includes(status) ? status : 'pending',
            priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
            created_at: new Date(),
            updated_at: new Date(),
            assigned_users: []
        };

        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const result = await db.collection('tasks').insertOne(taskData);
        
        const createdTask = await db.collection('tasks').findOne(
            { _id: result.insertedId },
            {
                projection: {
                    title: 1,
                    description: 1,
                    status: 1,
                    priority: 1,
                    created_at: 1,
                    updated_at: 1,
                    assigned_users: 1
                }
            }
        );
        
        res.status(201).json({
            success: true,
            data: {
                id: createdTask._id,
                ...createdTask
            }
        });
    } catch (err) {
        console.error('createTask error:', err);
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
        const { id } = req.params;
        if (!mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }

        const taskId = new mongodb.ObjectId(id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // Validate and prepare update data
        const { title, description, status, priority } = req.body;
        const updateData = {
            updated_at: new Date()
        };

        // Only include fields that are provided
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
            updateData.status = status;
        }
        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            updateData.priority = priority;
        }

        // Use updateOne instead of findOneAndUpdate
        const result = await db.collection('tasks').updateOne(
            { _id: taskId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Fetch the updated task
        const updatedTask = await db.collection('tasks').findOne({ _id: taskId });

        res.status(200).json({
            success: true,
            data: {
                id: updatedTask._id,
                title: updatedTask.title,
                description: updatedTask.description,
                status: updatedTask.status,
                priority: updatedTask.priority,
                updated_at: updatedTask.updated_at,
                created_at: updatedTask.created_at,
                assigned_users: updatedTask.assigned_users || []
            }
        });
    } catch (err) {
        console.error('updateTask error:', err);
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
        const { id } = req.params;
        if (!mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }

        const taskId = new mongodb.ObjectId(id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // First check if task exists
        const taskExists = await db.collection('tasks').findOne({ _id: taskId });
        if (!taskExists) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Delete the task
        const result = await db.collection('tasks').deleteOne({ _id: taskId });

        if (result.deletedCount === 1) {
            res.status(200).json({
                success: true,
                message: 'Task deleted successfully',
                data: {
                    id: taskId,
                    title: taskExists.title,
                    description: taskExists.description,
                    status: taskExists.status,
                    priority: taskExists.priority,
                    created_at: taskExists.created_at,
                    updated_at: taskExists.updated_at,
                    assigned_users: taskExists.assigned_users || []
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error deleting task'
            });
        }
    } catch (err) {
        console.error('deleteTask error:', err);
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
        const { id } = req.params;

        if (!mongodb.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }

        const taskId = new mongodb.ObjectId(id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // Check if task exists and get assigned users directly from tasks collection
        const task = await db.collection('tasks').findOne(
            { _id: taskId },
            { projection: { title: 1, assigned_users: 1 } }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Get user details for assigned users
        const assignees = task.assigned_users && task.assigned_users.length > 0 ?
            await db.collection('users')
                .find({ _id: { $in: task.assigned_users.map(id => new mongodb.ObjectId(id)) } })
                .project({ name: 1, email: 1 })
                .toArray() : [];

        res.status(200).json({
            success: true,
            data: {
                taskId: taskId.toString(),
                taskTitle: task.title,
                assigneeCount: assignees.length,
                assignees: assignees.map(user => ({
                    userId: user._id,
                    name: user.name,
                    email: user.email
                }))
            }
        });
    } catch (err) {
        console.error('getTaskAssignees error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching task assignees',
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
    getTaskAssignees,
    assignUserToTask
     
};