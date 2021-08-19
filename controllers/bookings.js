const mongoose = require('mongoose');
const bookingDebugger = require('debug')('app:booking');

// Create schemas
const bookingSchema = new mongoose.Schema({
    email: String, 
    desA: String, 
    desB: String, 
    num_people: Number,
    date_and_time: { type: Date, default: Date.now },
    noti_sent: { type: Boolean, default: false }, 
    resolved: { type: Boolean, default: false } 
})

// Compile these schema into a model --> a class
const Bookings = mongoose.model('Bookings', bookingSchema);



// ************************************************************** Booking Page **************************************************************
exports.booking_fn = (req, res) => {
    bookingDebugger(req.body);
    const { desA, desB, num_people } = req.body; 
    bookingDebugger("User " + req.params.email + " just booked a van"); 

    // Validate input
    // Missing a field
    if (desA == "" || desB == "" || (!num_people)) {
        return res.render('booking', {
            message_fail: "Missing one or more fields"
        })
    } else if (desA == desB) {
        return res.render('booking', {
            message_fail: "Destination A and Destination B cannot be the same"
        })
    }

    async function insertDes() {
        const reservation = new Bookings({
            email: req.params.email,
            desA: desA, 
            desB: desB, 
            num_people: num_people
        })

        const result = await reservation.save(); 
        bookingDebugger(result);
        if (result) {
            return res.render('booking', {
                message_success: "Successful! Refresh the page every 3 minutes to see confirmation"
            })
        } else {
            return res.render('booking', {
                message_fail: "Unsuccessful! Please try again!"
            })
        }
    }

    insertDes();
}



exports.populateBookings = async (req, res, next) => {
    if (req.user){
        try {
            const reservation_list = await Bookings.find({}); 

            if (!reservation_list) return next();

            var string = JSON.stringify(reservation_list);
            var book_list = JSON.parse(string);

            for (var i = 0; i < book_list.length; i++){
                book_list[i]["date_and_time"] = book_list[i]["date_and_time"].substring(0, 19);
            }

            req.reservations = book_list; 
            //bookingDebugger(req.reservations); 
            return next();
        } catch (error) {
            bookingDebugger(error);
            return next();
        }
    } 
    else {
        return next();
    }
}


exports.reservationInfo = async (req, res, next) => {
    try {
        const reservationObj = await Bookings.find({_id: req.params.id}); 
        bookingDebugger("controller: ", reservationObj); 

        var string = JSON.stringify(reservationObj);
        var instance = JSON.parse(string);

        instance[0]["date_and_time"] = instance[0]["date_and_time"].substring(0, 19);
        
        req.instance = instance[0]; 
        return next();
    } catch (error) {
        bookingDebugger(error);
        return next();
    }
}
