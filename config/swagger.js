const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'A simple Task Management API',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost',
        description: 'Development server',
      },
    ],
  },
  apis: ['./controller/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);
module.exports = specs;