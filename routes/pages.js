const express = require('express');
const authController = require('../controllers/auth');          // load a module
const bookingController = require('../controllers/bookings');   // load a module
const router = express.Router();

// each GET request is a page?
// res.render() function is used to render a view
router.get('/', authController.isLoggedIn, (req,res) => {
    if (req.user) {
        if (req.user.admin){
            res.render('admin_page', {
                user: req.user
            });             
        } else {
            res.render('index', {
                user: req.user
            }); 
        }
    } else {
        res.render('index');
    }
});

router.get('/register', (req,res) => {
    res.render('register'); 
});

router.get('/login', (req,res) => {
    res.render('login'); 
});

//only go to Booking listings if logged in
router.get('/admin_page', authController.isLoggedIn, bookingController.populateBookings, (req,res) => {
    if(req.user) {
        if (req.user.admin) {
            res.render('admin_page', {
                user: req.user,
                reservations: req.reservations
            });
        } 
        else {
            res.redirect('/login');
        }
    }
    else {
        res.redirect('/login');
    }
});

router.get('/each_reservation/:id', authController.isLoggedIn, bookingController.reservationInfo, (req,res) => {
    if(req.user && req.user.admin) {
        if(req.instance) {
            console.log("In Pages: ", req.instance); 
            res.render('each_reservation', {
                instance: req.instance
            });
        } else {
            res.redirect('/admin_page');
        }
    } else {
        res.redirect('/login');
    }
});


router.get('/settings', authController.isLoggedIn, (req,res) => {
    if (req.user) {
        res.render('settings', {
            user: req.user
        }); 
    } else {
        res.redirect('/login'); 
    }
});

router.get('/logout', (req,res) => {
    res.render('logout'); 
});

router.get('/booking', authController.isLoggedIn, (req,res) => {
    if (req.user) {
        res.render('booking', {
            user: req.user
        }); 
    } else {
        res.redirect('/login'); 
    }
});


module.exports = router; 



