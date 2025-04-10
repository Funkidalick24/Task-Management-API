const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controller/user');
const { isAuthenticated } = require('../middleware/auth');

// User routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', isAuthenticated, createUser);
router.put('/users/:id', isAuthenticated, updateUser);
router.delete('/users/:id', isAuthenticated, deleteUser);

module.exports = router;