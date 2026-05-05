const express = require('express');
const router = express.Router();

//importing the functions to protect some routes
const requireAuth = require('../middleware/auth.middleware');//make sure user have a token
const requireRole = require('../middleware/role.middleware');//make sure of the role

const freelancerController = require('../controllers/freelancer.controller');

router.get('/', requireAuth, requireRole('admin', 'client'), freelancerController.getFreelancers); // Route to get all freelancers
router.get('/new', requireAuth, requireRole('admin'), freelancerController.newFreelancerForm); // Route to show the form to create a new freelancer
router.post('/new', requireAuth, requireRole('admin'), freelancerController.createFreelancer); // Route to handle the form submission for creating a new freelancer
router.get('/show/:id', requireAuth, requireRole('admin', 'client', 'freelancer'), freelancerController.showFreelancer); // Route to show the details of a specific freelancer
router.get('/edit/:id', requireAuth, requireRole('admin', 'freelancer'), freelancerController.editFreelancerForm); // Route to show the form to edit a specific freelancer
router.post('/edit/:id', requireAuth, requireRole('admin', 'freelancer'), freelancerController.updateFreelancer); // Route to handle the form submission for updating a specific freelancer
router.post('/delete/:id', requireAuth, requireRole('admin'), freelancerController.deleteFreelancer); // Route to handle the deletion of a specific freelancer

module.exports = router;