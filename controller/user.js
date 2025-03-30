const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const connectDB = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone_number
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone_number:
 *           type: string
 *           description: User's contact number
 *         role:
 *           type: string
 *           enum: [admin, contributor, viewer]
 *           default: contributor
 *         assigned_tasks:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of task IDs assigned to this user
 *         created_at:
 *           type: string
 *           format: date-time
 * 
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *   
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, contributor, viewer]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 * 
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, contributor, viewer]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

// Get all users
const getUsers = async (req, res) => {
    let client;
    try {
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const users = await db.collection('users').find().toArray();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error fetching users', 
            error: err.message 
        });
    } finally {
        if (client) await client.close();
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    let client;
    try {
        const id = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const user = await db.collection('users').findOne({ _id: id });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error fetching user', 
            error: err.message 
        });
    } finally {
        if (client) await client.close();
    }
};

// Create new user
const createUser = async (req, res) => {
    let client;
    try {
        const { name, email, role, phone_number } = req.body;
        
        if (!name || !email || !phone_number) {
            return res.status(400).json({
                message: 'Name, email and phone number are required',
                required: ['name', 'email', 'phone_number']
            });
        }

        const user = {
            name,
            email,
            phone_number,
            role: role || 'contributor',
            assigned_tasks: [],
            created_at: new Date()
        };

        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const result = await db.collection('users').insertOne(user);
        
        res.status(201).json({
            message: 'User created successfully',
            id: result.insertedId,
            user
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Error creating user', 
            error: err.message 
        });
    } finally {
        if (client) await client.close();
    }
};

// Update user
const updateUser = async (req, res) => {
    let client;
    try {
        const id = new mongodb.ObjectId(req.params.id);
        const updateData = { ...req.body };
        delete updateData._id; // Prevent _id modification

        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        
        const result = await db.collection('users').updateOne(
            { _id: id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Error updating user', 
            error: err.message 
        });
    } finally {
        if (client) await client.close();
    }
};

// Delete user
const deleteUser = async (req, res) => {
    let client;
    try {
        const id = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        
        const result = await db.collection('users').deleteOne({ _id: id });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({
            message: 'User deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Error deleting user', 
            error: err.message 
        });
    } finally {
        if (client) await client.close();
    }
};

const getTasks = async (req, res) => {
    let client;
    try {
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const tasks = await db.collection('tasks').find().toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error fetching tasks', 
            error: err.message 
        });
    } finally {
        if (client) await client.close();
    }
};

const getTask = async (req, res) => {
    let client;
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const task = await db.collection('tasks').findOne({ _id: taskId });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(task);
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            res.status(400).json({ message: 'Invalid task ID format' });
        } else {
            res.status(500).json({ 
                message: 'Error fetching task', 
                error: err.message 
            });
        }
    } finally {
        if (client) await client.close();
    }
};

const createTask = async (req, res) => {
    let client;
    try {
        const { taskName, taskDescription, status, category } = req.body;
        if (!taskName || !taskDescription) {
            return res.status(400).json({
                message: 'Task name and description are required',
                required: ['taskName', 'taskDescription']
            });
        }
        if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status value',
                allowedValues: ['pending', 'in-progress', 'completed']
            });
        }
        const task = {
            taskName,
            taskDescription,
            status: status || 'pending',
            category: category || 'general',
            createdAt: new Date()
        };
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const result = await db.collection('tasks').insertOne(task);
        if (!result.acknowledged) {
            throw new Error('Failed to create task');
        }
        res.status(201).json({
            message: 'Task created successfully',
            id: result.insertedId,
            task
        });
    } catch (err) {
        res.status(500).json({ 
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
        if (!req.params.id) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const taskId = new mongodb.ObjectId(req.params.id);
        const { taskName, taskDescription, status, category } = req.body;
        if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status value',
                allowedValues: ['pending', 'in-progress', 'completed']
            });
        }
        const updateData = {
            ...(taskName && { taskName }),
            ...(taskDescription && { taskDescription }),
            ...(status && { status }),
            ...(category && { category }),
            updatedAt: new Date()
        };
        if (Object.keys(updateData).length === 1) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const result = await db.collection('tasks')
            .updateOne({ _id: taskId }, { $set: updateData });
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({
            message: 'Task updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            res.status(400).json({ message: 'Invalid task ID format' });
        } else {
            res.status(500).json({ 
                message: 'Error updating task', 
                error: err.message 
            });
        }
    } finally {
        if (client) await client.close();
    }
};

const deleteTask = async (req, res) => {
    let client;
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const result = await db.collection('tasks')
            .deleteOne({ _id: taskId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({
            message: 'Task deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            res.status(400).json({ message: 'Invalid task ID format' });
        } else {
            res.status(500).json({ 
                message: 'Error deleting task', 
                error: err.message 
            });
        }
    } finally {
        if (client) await client.close();
    }
};

const assignUsersToTask = async (req, res) => {
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

/**
 * @swagger
 * /api/tasks/{id}/assignees:
 *   get:
 *     summary: Get users assigned to a task
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
 *         description: List of users assigned to the task
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: User's ID
 *                   name:
 *                     type: string
 *                     description: User's name
 *                   email:
 *                     type: string
 *                     description: User's email
 *                   assigned_at:
 *                     type: string
 *                     format: date-time
 *                     description: When the user was assigned to the task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                 error:
 *                   type: string
 */
const getTaskAssignees = async (req, res) => {
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const task = await db.collection('tasks').findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const assignments = await db.collection('task_assignments')
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
            taskId: taskId.toString(),
            taskTitle: task.title,
            assigneeCount: assignments.length,
            assignees: assignments
        });
    } catch (err) {
        if (err instanceof mongodb.MongoParseError || err instanceof mongodb.BSONTypeError) {
            res.status(400).json({ message: 'Invalid task ID format' });
        } else {
            res.status(500).json({
                message: 'Error fetching task assignees',
                error: err.message
            });
        }
    } finally {
        if (client) await client.close();
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    assignUsersToTask,
    getTaskAssignees
};