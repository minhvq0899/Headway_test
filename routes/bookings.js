const express = require('express');
const bookingController = require('../controllers/bookings')   // load a module
const router = express.Router();

// create a controller that can deal with all the data
// booking
router.post('/booking/:email', bookingController.booking_fn);
router.post('/admin_page', bookingController.populateBookings);

module.exports = router; 

