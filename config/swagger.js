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
        url: process.env.PROD_URL || 'https://task-management-api-umwk.onrender.com',
        description: 'Production server',
       
      },
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
        
      }
    ],
    
  },
  apis: ['./controller/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;