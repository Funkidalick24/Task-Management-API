const express = require('express');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const taskRoutes = require('./routes/task');

const app = express();
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api', taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

