const express = require("express");
const path = require('path'); 
const mongoose = require('mongoose')
const dotenv = require('dotenv'); 
const cookieParser = require('cookie-parser'); 
const startupDebug = require('debug')('app:startup');
const dbDebug = require('debug')('app:db'); 
const rateLimit = require('./middleware/rateLimiter'); 
// ------ API roles and permission with Casbin ------
// const { NestFactory } = require('@nestjs/core');
// const { AppModule } = require('./app.module');

const casbin = require('casbin');
const authz = require('./RBAC_casbin/authorization.middleware');
// ---------------------------------------------------

dotenv.config({ path: './.env'}); 

const app = express(); 

// Connect to a Database
mongoose.connect('mongodb://localhost/vans_service', { useNewUrlParser: true, useUnifiedTopology: true} )
    .then( () => console.log('Connected to MongoDB...') )
    .catch(err => console.log('Could not connect to MongoDB...', err))

// front end files
const publicDirectory = path.join(__dirname, './public'); 
// make sure express is actually using this directory
app.use(express.static(publicDirectory));

// parse URL-encoded bodies (as sent by HTML forms)
// make sure you can grab data from any form
app.use(express.urlencoded({ extended: false})); 
// Parse JSON bodies(as sent by API clients)
// make sure the value we grabbed from the form, it comes in JSON
app.use(express.json()); 
app.use(cookieParser()); 

// Rate limit
app.use(rateLimit.rateLimiterUsingThirdParty);

app.set('view engine', 'hbs'); 
 
// define routes
app.use('/auth', require('./routes/auth')); 
app.use('/bookings', require('./routes/bookings')); 

// Casbin
app.use(authz.authz_fn(async() => {
    try {
        const enforcer = await casbin(path.join(__dirname, './RBAC_casbin/casbin_conf/model.conf'), path.join(__dirname, './RBAC_casbin/casbin_conf/policy.csv'));
        return enforcer;
    } catch (error) {
        console.log(error); 
        return; 
    }
}));

app.listen(5000, () => {
    startupDebug("Server started on Port 5000"); 
});


