/*
    SEED SCRIPT — seed/seed-admin.js
    
    A seed script is a standalone Node.js file that runs independently from the Express app.
    Its job is to pre-populate the database with initial data before the app launches.
    
    WHY WE NEED IT:
    The admin account cannot be created through the public registration form —
    that would be a security risk. So we create it once manually by running:
        node seed/seed-admin.js
    
    This script will connect to MongoDB, create one admin user with a hashed password,
    then disconnect. You only run it once before deployment.
*/


// Load environment variables from .env file
require('dotenv').config();

// We need mongoose to connect to MongoDB
const mongoose = require('mongoose');

// We need bcrypt to hash the password before saving
const bcrypt = require('bcrypt');

const User = require('../models/user.model');

const seedAdmin = async () => {

    // Step 1: Connect to MongoDB using the URI from .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    // Step 3: Create the admin user document
    const admin = new User({
        name: 'Admin',
        email: 'admin@agency.com',
        password: hashedPassword,
        role: 'admin'
        // no refId or roleRef — admin has no linked Client or Freelancer document
    });

    await admin.save();
    console.log('Admin user created successfully');

    // Step 4: Close the MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

}; 

// Run the seed script
seedAdmin();