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
 *         role:
 *           type: string
 *           enum: [admin, contributor, viewer]
 *           default: contributor
 *           description: User's role in the system
 *         phone_number:
 *           type: string
 *           description: User's contact phone number
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         tasks:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of task IDs assigned to the user
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - due_date
 *         - priority
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
 *           description: Current status of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           default: medium
 *           description: Priority level of the task
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: Task deadline
 *         assigned_to:
 *           type: string
 *           description: ID of the user assigned to the task
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
const getUsers = async (req, res) => {
    let client;
    try {
        const { client: dbClient, db } = await connectDB();
        client = dbClient;
        const users = await db.collection('users').find().toArray();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    } finally {
        if (client) await client.close();
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
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
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    } finally {
        if (client) await client.close();
    }
};

/**
 * @swagger
 * /api/users:
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [admin, contributor, viewer]
 *               profile_picture:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Name and email are required
 *                 required:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
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
            role: role || 'contributor',
            phone_number,
            tasks: [],
            created_at: new Date()
        };

        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // Check if user with email already exists
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
        res.status(500).json({ message: 'Error creating user', error: err.message });
    } finally {
        if (client) await client.close();
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               role:
 *                 type: string
 *                 enum: [admin, contributor, viewer]
 *               profile_picture:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
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
        res.status(500).json({ message: 'Error updating user', error: err.message });
    } finally {
        if (client) await client.close();
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
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
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    } finally {
        if (client) await client.close();
    }
};

const createTask = async (req, res) => {
    let client;
    try {
        const { title, description, status, priority, due_date, assigned_to } = req.body;

        // Validate required fields
        if (!title || !description || !priority || !due_date) {
            return res.status(400).json({
                message: 'Title, description, priority and due date are required',
                required: ['title', 'description', 'priority', 'due_date']
            });
        }

        // Validate status
        if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status value',
                allowedValues: ['pending', 'in-progress', 'completed']
            });
        }

        // Validate priority
        if (!['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                message: 'Invalid priority value',
                allowedValues: ['low', 'medium', 'high']
            });
        }

        const task = {
            title,
            description,
            status: status || 'pending',
            priority,
            due_date: new Date(due_date),
            assigned_to: assigned_to ? new mongodb.ObjectId(assigned_to) : null,
            created_at: new Date()
        };

        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // Verify assigned user exists if provided
        if (assigned_to) {
            const user = await db.collection('users').findOne({ 
                _id: new mongodb.ObjectId(assigned_to) 
            });
            if (!user) {
                return res.status(400).json({ message: 'Assigned user not found' });
            }
        }

        const result = await db.collection('tasks').insertOne(task);
        
        // Update user's tasks array if assigned
        if (assigned_to) {
            await db.collection('users').updateOne(
                { _id: new mongodb.ObjectId(assigned_to) },
                { $push: { tasks: result.insertedId } }
            );
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

const updateTask = async (req, res) => {
    let client;
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        const taskId = new mongodb.ObjectId(req.params.id);
        const { taskName, taskDescription, status, category } = req.body;
        // Validate status if provided
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
        if (Object.keys(updateData).length === 1) { // Only updatedAt exists
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
    deleteTask
};