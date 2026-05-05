require('dotenv').config()
//^ Load environment variables from .env file - reads my .env files

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const cors = require('cors');
app.use(cors());

const cookieParser = require('cookie-parser');


app.use(express.static('public')); // Serve static files from the 'public' directory

//Middleware to parse JSON bodies
app.use(express.json());

//Middle ware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

//Middleware for cookie parsing and session management
app.use(cookieParser());

//Rate limiting that prevents brute force attacks
//100 requests in 15 minutes per IP address

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,                  // max 100 requests per IP per window
    message: 'Too many requests.'
});
app.use(limiter);

// Middleware that runs on every request to attach the logged-in user to req.user
//It reads the cookie, decodes the JWT, and attaches the result to req.user.

/*So after populateUser runs, every request has req.user set to either:
{ userId, role, name } — if logged in
null — if not logged in*/
function populateUser(req, res, next) {
    const token = req.cookies.token; // Read the JWT from the browser cookie named 'token'
    if (!token) {
        req.user = null; // No cookie means no logged-in user
        return next();  // Skip token verification and move on
    }
    // Verify the token's signature using the secret key stored in .env
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        req.user = err ? null : decoded; // If invalid/expired set user to null, otherwise use the decoded payload
        next(); // Pass control to the next middleware or route
    });
}
app.use(populateUser); // Register populateUser globally so every route has access to req.user

// EJS :
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', './views'); // Set the directory for EJS templates

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)//connect to the database using the connection string from the environment variable
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB", err));


//Routes
const jobRoutes = require('./routes/job.routes');
const freelancerRoutes = require('./routes/freelancer.routes');
const clientRoutes = require('./routes/client.routes');
const applicationRoutes = require('./routes/application.routes'); 
const authRoutes = require('./routes/auth.routes');
const homeRoutes = require('./routes/home.routes');

//use routes

app.use('/jobs', jobRoutes);
app.use('/freelancers', freelancerRoutes);
app.use('/clients', clientRoutes);
app.use('/applications', applicationRoutes);
app.use('/auth', authRoutes);
app.use('/', homeRoutes);

// error 404 handled 
app.use((req, res) => {
    res.status(404).render('errors/404', { user: req.user });
});

// error 500 handled 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500', { user: req.user });
});


//Start the server
const Port = process.env.PORT || 3000;
app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
