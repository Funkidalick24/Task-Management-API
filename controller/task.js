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
 *       404:
 *         description: Task not found
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
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Missing required fields
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
 *       404:
 *         description: Task not found
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
 *       404:
 *         description: Task not found
 */
const getTasks = async (req, res) => {
    try {
        const { client: dbClient, db } = await connectDB();
        const result = await db.collection('tasks').find().toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
        dbClient.close();
    } catch (err) {
        res.status(500).json({ message: err.message });
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
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        const result = await db.collection('tasks').findOne({ _id: taskId });
        
        if (!result) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
        dbClient.close();
    } catch (err) {
        res.status(500).json({ message: err.message });
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
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Missing required fields
 */
const createTask = async (req, res) => {
    try {
        const task = {
            taskName: req.body.taskName,
            taskDescription: req.body.taskDescription,
            status: req.body.status || 'pending',
            category: req.body.category || 'general',
            createdAt: new Date()
        };

        if (!task.taskName || !task.taskDescription) {
            return res.status(400).json({ 
                message: 'Task name and description are required'
            });
        }

        const { client: dbClient, db } = await connectDB();
        const result = await db.collection('tasks').insertOne(task);
        
        if (result.acknowledged) {
            res.status(201).json({ id: result.insertedId, ...task });
        } else {
            res.status(500).json({ message: 'Error creating task' });
        }
        dbClient.close();
    } catch (err) {
        res.status(500).json({ message: err.message });
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
 *       404:
 *         description: Task not found
 */
const updateTask = async (req, res) => {
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const task = {
            taskName: req.body.taskName,
            taskDescription: req.body.taskDescription,
            status: req.body.status,
            category: req.body.category,
            updatedAt: new Date()
        };

        // Remove undefined fields
        Object.keys(task).forEach(key => 
            task[key] === undefined && delete task[key]
        );

        const { client: dbClient, db } = await connectDB();
        const result = await db.collection('tasks')
            .updateOne({ _id: taskId }, { $set: task });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).send();
        dbClient.close();
    } catch (err) {
        res.status(500).json({ message: err.message });
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
 *       404:
 *         description: Task not found
 */
const deleteTask = async (req, res) => {
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        const result = await db.collection('tasks')
            .deleteOne({ _id: taskId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).send();
        dbClient.close();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
};