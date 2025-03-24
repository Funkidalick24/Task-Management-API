const mongodb = require('mongodb');
require('dotenv').config();

const MongoClient = mongodb.MongoClient;
const url = process.env.MONGODB_URL;

if (!url) {
    throw new Error('MONGODB_URL is not defined in environment variables');
}

const connectDB = async () => {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db('task-management');
        console.log('Connected to MongoDB Atlas successfully');
        return { client, db };
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

module.exports = connectDB;