/* every other controller in this project depends on knowing who the user is.
so we first began by creating auth.controller.js to handle all the authentication logic. 
This includes :
1-(registering new users), 
2-(logging in existing users),  
3-(logging out users). 
*/

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const Client = require('../models/client.model');
const Freelancer = require('../models/freelancer.model');

//function that returns the registration form
exports.getRegister = (req, res) => {
    res.render('auth/register', { user: req.user });
};

//function that handles the registration form 
exports.postRegister = async (req, res) => {
    try {
        //extract the data from the req body 
        const { name, email, password, role, company, phone, country, skills, hourlyRate, bio } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); //hash the password using bcrypt
        let refId = null;
        let roleRef = null;

        if (role === 'client') {
            const client = await Client.create({ name, email, company, phone, country });
            refId = client._id;
            roleRef = 'Client';
        } else if (role === 'freelancer') {
            const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : [];
            const freelancer = await Freelancer.create({ name, email, skills: skillsArray, hourlyRate, country, bio });
            refId = freelancer._id;
            roleRef = 'Freelancer';
        }
        //create the new user
        await User.create({ name, email, password: hashedPassword, role, refId, roleRef });
        //should login first so he can get a token 
        res.redirect('/auth/login');


    } catch (err) {
        console.error(err);
        res.status(500).send('Registration failed: ' + err.message);
    }
};

//function that returns the login form
exports.getLogin = (req, res) => {
    res.render('auth/login', { user: req.user });
};

//function that handles the login form
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        //check email
        const user = await User.findOne({ email });
        if (!user)
                  return res.render('auth/login', { user: null, error: 'Invalid email or password' });
        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)   return res.render('auth/login', { user: null, error: 'Invalid email or password' });

        //create a token
        //we need to keep in that token: the user's id , user's role and secret key 
        const token = jwt.sign(
            { userId: user._id, role: user.role, name: user.name, refId: user.refId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }//token gets deleted from browsser after 1 hour!
        );
        //store the token in a cookie, that will be stored in the user's browser
        res.cookie('token', token, { httpOnly: true });
        //httpOnly is : to make sure only the server can access the cookie, not JS , protects against attacks
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
       res.status(500).render('errors/500', { user: null });
    }
};

//function that handles logging out the user
exports.logout = (req, res) => {
    res.clearCookie('token'); // Clear the token cookie to log out the user
    res.redirect('/auth/login'); // Redirect to the login page after logout
};