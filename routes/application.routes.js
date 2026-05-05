const express = require('express');
const router = express.Router();

//importing the functions to protect some routes
const requireAuth = require('../middleware/auth.middleware');//make sure user have a token
const requireRole = require('../middleware/role.middleware');//make sure of the role

const applicationController = require('../controllers/application.controller');

router.get('/', requireAuth, requireRole('admin', 'client', 'freelancer'), applicationController.getApplications); // Route to get all applications
router.get('/new', requireAuth, requireRole('freelancer'), applicationController.newApplicationForm); // Route to show the form to create a new application
router.post('/new', requireAuth, requireRole('freelancer'), applicationController.createApplication); // Route to handle the form submission for creating a new application
//endpoint to get applications by job
router.get('/job/:jobId', requireAuth, requireRole('admin', 'client'), applicationController.getApplicationsByJob);
//endpoint to get applications by freelancer
router.get('/freelancer/:freelancerId', requireAuth, requireRole('admin', 'freelancer'), applicationController.getApplicationsByFreelancer);
router.get('/show/:id', requireAuth, requireRole('admin', 'client', 'freelancer'), applicationController.showApplication); // Route to show the details of a specific application
router.get('/edit/:id', requireAuth, requireRole('freelancer'), applicationController.editApplicationForm); // Route to show the form to edit a specific application
router.post('/edit/:id', requireAuth, requireRole('freelancer'), applicationController.updateApplication); // Route to handle the form submission for updating a specific application
router.post('/delete/:id', requireAuth, requireRole('admin', 'freelancer'), applicationController.deleteApplication); // Route to handle the deletion of a specific application
router.post('/accept/:id', requireAuth, requireRole('admin', 'client'), applicationController.acceptApplication);//Route to accept an application
router.post('/reject/:id', requireAuth, requireRole('admin', 'client'), applicationController.rejectApplication);//Route to reject an application

module.exports = router;