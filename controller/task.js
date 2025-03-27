const express = require('express');
const router = express.Router();
const taskController = require('../controller/task');
const mongodb = require('mongodb');
const connectDB = require('../config/db');

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
 *         description:
 *           type: string
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

/**
 * @swagger
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
 *                 example: ["user1@example.com", "user2@example.com"]
 *     responses:
 *       200:
 *         description: Users assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 assignedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
const assignUsersToTask = async (req, res) => {
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { userEmails } = req.body; // Change from userIds to userEmails

        if (!Array.isArray(userEmails) || userEmails.length === 0) {
            return res.status(400).json({
                message: 'User emails array is required'
            });
        }

        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // Verify task exists
        const task = await db.collection('tasks').findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Find users by email instead of ID
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

        // Create assignments
        const assignments = userIds.map(userId => ({
            task_id: taskId,
            user_id: userId,
            assigned_at: new Date()
        }));

        await db.collection('task_assignments').insertMany(assignments);

        // Update task with assigned users
        await db.collection('tasks').updateOne(
            { _id: taskId },
            { $addToSet: { assigned_users: { $each: userIds } } }
        );

        // Update users' assigned tasks
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

// Add this Swagger documentation before the getTaskAssignees function
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
 *                   type: string
 *                 error:
 *                   type: string
 */

// Update the getTaskAssignees function to include proper error handling
const getTaskAssignees = async (req, res) => {
    let client;
    try {
        const taskId = new mongodb.ObjectId(req.params.id);
        const { client: dbClient, db } = await connectDB();
        client = dbClient;

        // First check if task exists
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
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    assignUsersToTask,
    getTaskAssignees
};