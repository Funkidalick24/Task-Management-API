const mongodb = require('mongodb');
require('dotenv').config();

const MongoClient = mongodb.MongoClient;
const url = process.env.MONGODB_URL;

if (!url) {
    throw new Error('MONGODB_URL is not defined in environment variables');
}

const initializeCollections = async (db) => {
    try {
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        // Initialize users collection
        if (!collectionNames.includes('users')) {
            await db.createCollection('users');
            
            await db.collection('users').createIndexes([
                { key: { email: 1 }, unique: true },
                { key: { name: 1 } },
                { key: { role: 1 } }
            ]);

            await db.command({
                collMod: 'users',
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['name', 'email', 'role'],
                        properties: {
                            name: { bsonType: 'string' },
                            email: { bsonType: 'string' },
                            role: { 
                                enum: ['admin', 'contributor', 'viewer'],
                                description: 'must be one of: admin, contributor, viewer'
                            },
                            created_at: { bsonType: 'date' },
                            profile_picture: { bsonType: 'string' },
                            assigned_tasks: {
                                bsonType: 'array',
                                items: { bsonType: 'objectId' }
                            }
                        }
                    }
                }
            });
        }

        // Initialize tasks collection
        if (!collectionNames.includes('tasks')) {
            await db.createCollection('tasks');
            
            await db.collection('tasks').createIndexes([
                { key: { status: 1 } },
                { key: { priority: 1 } },
                { key: { due_date: 1 } }
            ]);

            await db.command({
                collMod: 'tasks',
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['title', 'description'],
                        properties: {
                            title: { bsonType: 'string' },
                            description: { bsonType: 'string' },
                            status: {
                                enum: ['pending', 'in-progress', 'completed'],
                                default: 'pending'
                            },
                            priority: {
                                enum: ['low', 'medium', 'high'],
                                default: 'medium'
                            },
                            due_date: { bsonType: 'date' },
                            assigned_users: {
                                bsonType: 'array',
                                items: { bsonType: 'objectId' },
                                description: 'Array of user IDs assigned to this task'
                            }
                        }
                    }
                }
            });
        }

        // Create task-user assignments collection for many-to-many relationship
        if (!collectionNames.includes('task_assignments')) {
            await db.createCollection('task_assignments');
            
            await db.collection('task_assignments').createIndexes([
                { key: { task_id: 1, user_id: 1 }, unique: true },
                { key: { user_id: 1 } },
                { key: { assigned_at: 1 } }
            ]);

            await db.command({
                collMod: 'task_assignments',
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['task_id', 'user_id', 'assigned_at'],
                        properties: {
                            task_id: { bsonType: 'objectId' },
                            user_id: { bsonType: 'objectId' },
                            assigned_at: { bsonType: 'date' },
                            assigned_by: { bsonType: 'objectId' }
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error initializing collections:', error);
        throw error;
    }
};

const connectDB = async () => {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db('task-management');
        
        // Initialize collections and indexes
        await initializeCollections(db);
        
        console.log('Connected to MongoDB Atlas successfully');
        return { client, db };
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

module.exports = connectDB;