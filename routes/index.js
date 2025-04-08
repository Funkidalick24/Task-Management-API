const router = require('express').Router();

router.use('/swagger', require('../config/swagger'));
router.use('/tasks', require('./task'));
router.use('/users', require('./user'));

router.get('/login', passport.authenticate('github'), (req, res) => {
  res.redirect('/');
});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;