const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 
const nodemailer = require("nodemailer");
const authDebug = require('debug')('app:auth');

// Create schemas
const userSchema = new mongoose.Schema({
    first_name: String, 
    last_name: String, 
    grad_year: Number, 
    email: String,
    password: String,
    admin: Boolean
});
userSchema.methods.generateAuthToken = function() {
    const id = this._id; 
    const first_name = this.first_name; 
    const last_name = this.last_name; 
    const email = this.email; 
    const admin = this.admin;
    const token = jwt.sign( { id: id, fname: first_name, lname: last_name, email: email, admin: admin }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    } );
    return token; 
}; 

// Compile these schema into a model --> a class
const Users = mongoose.model('Users', userSchema); 



// ************************************************************** Register, Login and Logout **************************************************************
// A FUNCTION to handle a POST request for register
exports.register_fn = (req, res) => {
    const { first_name, last_name, grad_year, email, password, password_confirm } = req.body; 

    // Validate input
    // Missing a field
    if (first_name == "" || last_name == "" || grad_year == "" || email == "" || password == "" || password_confirm == "") {
        res.status(400).send("Mising a field");    
    }
    // Check if it's a Clark email
    if (!email.includes("@clarku.edu")) {
        res.status(400).send("Not a Clark email");    
    }

    // Validation done. Now insert the new account into our database
    async function insertNewAcc() {
        // Encrypt password
        let hashedPassword = await bcrypt.hash(password, 8);
        const newAcc = new Users({
            first_name: first_name,
            last_name: last_name,
            grad_year: grad_year, 
            email: email,
            password: hashedPassword,
            admin: false
        })

        const result = await newAcc.save(); 
        authDebug(result);

        res.status(200).send("Register successfully");    
    }
    
    // Check for duplicate email
    async function getEmail() {
        const email_list = await Users.find({ email: email });
        authDebug('Email list', email_list); 

        if (email_list.length > 0) {
            res.status(400).send("Email taken");     
        } else if ( password !== password_confirm ) {
            res.status(400).send("Pasword do not match");    
        } else {
            insertNewAcc(); 
        }
    }

    getEmail(); 
}



// A FUNCTION to handle a POST request for login
exports.login_fn = async (req, res) => {
    try {
        const { email, password } = req.body; 
        // validate input
        if ( !email || !password ) {
            res.status(400).send("Please provide both email and password");    
        }

        // query db to check if the provided email and password are correct
        const email_list = await Users.find({ email: email });
        authDebug('Email list', email_list); 
        const user = email_list[0]; 

        if ( email_list.length == 0 || !(await bcrypt.compare(password, user.password)) ) {
            res.status(401).send("Email or Password is incorrect");    
        } else {
            // create a token for each user
            const token = user.generateAuthToken(); 

            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 
                ), 
                httpOnly: true
            }

            res.cookie('jwt', token, cookieOptions); 
            authDebug(token); 
            if (user.admin) {
                res.status(200).send("User is an admin"); 
            } else {
                res.status(200).send("User is a user"); 
            }
        }
    } catch (error) {
        authDebug(error); 
    }
}



// LOGOUT
exports.logout_fn = async (req, res) => {
    authDebug("Someone wants to logout...");
    res.cookie('jwt', 'logout_fn', {
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true
    });
    req.session = null;
    authDebug("Someone has just logged out");
    res.status(200).send('Log out successfully');
}

    

// Check logged in status
exports.isLoggedIn = async (req, res, next) => {
    const token = req.cookies.jwt; 
    if (!token) {return next()}; 

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded; 
        return next(); 
    } 
    catch (ex) {
        // res.status(400).send('invalid token'); 
        return next();
    }
}






// ************************************************************** Setting: Update name, email, password, etc **************************************************************
exports.update_fn = async (req, res) => {
    authDebug(req.body); 

    try {     
        const result = await Users.updateOne( {email: req.params.email}, {
            $set: {
                "first_name": req.body.newFName,
                "last_name": req.body.newLName
            }
        }, {upsert: false} )
        authDebug(result); 
        res.status(200).send('Update successfully');
    } catch (error) {
        authDebug(error); 
        res.status(400).send('Update fail. Please try again');
    }
}








