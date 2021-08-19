const express = require('express');
const authController = require('../controllers/auth');          // load a module
const router = express.Router();

// create a controller that can deal with all the data
// authentication
router.post('/register', authController.register_fn); 
router.post('/login', authController.login_fn);
router.get('/logout', authController.logout_fn);
router.post('/update/:email', authController.update_fn);

module.exports = router; 



