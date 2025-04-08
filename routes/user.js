const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,    
    createUser,
    updateUser,
    deleteUser  
} = require('../controller/user');
const {isAuthenticated} = require('../middleware/auth');


// Public routes (read-only)
router.get('/users',getUsers);
router.get('/users/:id', getUserById);

// Protected routes (data modification)
router.post('/users', isAuthenticated,createUser);
router.put('/users/:id', isAuthenticated,updateUser);

// Admin-only routes
router.delete('/users/:id', isAuthenticated, deleteUser);

module.exports = router;