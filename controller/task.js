const mongodb = require('mongodb');
const connectDB = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - taskName
 *         - taskDescription
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         taskName:
 *           type: string
 *           description: Name of the task
 *         taskDescription:
 *           type: string
 *           description: Detailed description of the task
 *         status:
 *           type: string
 *           description: Current status of the task
 *           enum: [pending, in-progress, completed]
 *           default: pending
 *         category:
 *           type: string
 *           description: Category of the task
 *           default: general
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Task creation timestamp
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching tasks
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by id
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
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid task ID format
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
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

/**
 * @swagger
 * /api/tasks:
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
 *               - taskName
 *               - taskDescription
 *             properties:
 *               taskName:
 *                 type: string
 *               taskDescription:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task name and description are required
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

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
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
 *               taskName:
 *                 type: string
 *               taskDescription:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: number
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid task ID format
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
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

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid task ID format
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
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

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by id
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
 *       404:
 *         description: Task not found
 */
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

/**
 * @swagger
 * /api/tasks:
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
 *               - taskName
 *               - taskDescription
 *             properties:
 *               taskName:
 *                 type: string
 *               taskDescription:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task name and description are required
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
const createTask = async (req, res) => {
    let client;
    try {
        const { taskName, taskDescription, status, category } = req.body;

        // Input validation
        if (!taskName || !taskDescription) {
            return res.status(400).json({ 
                message: 'Task name and description are required',
                required: ['taskName', 'taskDescription']
            });
        }

        // Validate status if provided
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

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
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
 *               taskName:
 *                 type: string
 *               taskDescription:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: number
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid task ID format
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
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

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid task ID format
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
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
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
};