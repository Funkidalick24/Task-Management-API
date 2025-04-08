const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ 
        success: false, 
        message: 'Please authenticate using GitHub to access this resource' 
    });
};



module.exports = { isAuthenticated};