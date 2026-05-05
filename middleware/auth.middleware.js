/*This file has one job — export a function called requireAuth 
that checks if the user is logged in.*/


// Middleware to verify JWT from cookie
const jwt = require('jsonwebtoken'); // JWT library for token verification

const requireAuth = (req, res, next) => { 
    const token = req.cookies.token; // read the JWT stored in the "token" cookie

    if (!token) { // no token means the user is not logged in
        return res.redirect('/auth/login'); // send unauthenticated users to the login page
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); // decode and verify the token signature
        req.user = verified; // attach the decoded payload (user info) to the request object
        next(); // token is valid — pass control to the next middleware/route handler
    } catch (err) { 
        res.redirect('/auth/login'); 
    }
};

module.exports = requireAuth; // export so routes can use this as middleware