// This file exports requireRole, a middleware factory that restricts
// route access to users whose role matches one of the allowed roles.


const requireRole = (...roles) => {

    return (req, res, next) => {
        // Check if the authenticated user's role is NOT in the allowed roles list
        if (!roles.includes(req.user.role)) {
            // Forbidden: send a 403 status and render the 403 error page, passing the user for display
            return res.status(403).render('errors/403', { user: req.user });
        }

        next();
    };
};


module.exports = requireRole;