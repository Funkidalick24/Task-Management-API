const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API for managing tasks and user assignments',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.PRODUCTION_URL 
          : 'http://localhost:3000',
      },
    ],
  },
  apis: [
    './controllers/*.js',  // Add controllers path
    './routes/*.js'
  ],
};

module.exports = swaggerJsdoc(options);