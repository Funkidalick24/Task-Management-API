const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description: 'A task management API documentation',
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_URL 
                    : 'http://localhost:3000',
            },
        ],
    },
    apis: ['./controller/*.js', './models/*.js', './routes/*.js']  // Updated path
};

module.exports = swaggerJsdoc(options);