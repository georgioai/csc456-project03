const express = require('express');
const router = express.Router();

//importing the functions to protect some routes
const requireAuth = require('../middleware/auth.middleware');//make sure user have a token
const requireRole = require('../middleware/role.middleware');//make sure of the role

const jobController = require('../controllers/job.controller');

router.get('/', requireAuth, requireRole('admin', 'client', 'freelancer'), jobController.getJobs); // Route to get all jobs
router.get('/new', requireAuth, requireRole('admin', 'client'), jobController.newJobForm); // Route to show the form to create a new job
router.post('/new', requireAuth, requireRole('admin', 'client'), jobController.createJob); // Route to handle the form submission for creating a new job
//endpoint to get jobs by client
router.get('/client/:clientId', requireAuth, requireRole('admin', 'client', 'freelancer'), jobController.getJobsByClient);
//filter job by its status 
router.get('/filter', requireAuth, requireRole('admin', 'client', 'freelancer'), jobController.filterJobs);
router.get('/show/:id', requireAuth, requireRole('admin', 'client', 'freelancer'), jobController.showJob); // Route to show the details of a specific job
router.get('/edit/:id', requireAuth, requireRole('admin', 'client'), jobController.editJobForm); // Route to show the form to edit a specific job
router.post('/edit/:id', requireAuth, requireRole('admin', 'client'), jobController.updateJob); // Route to handle the form submission for updating a specific job
router.post('/delete/:id', requireAuth, requireRole('admin', 'client'), jobController.deleteJob); // Route to handle the deletion of a specific job
router.post('/close/:id', requireAuth, requireRole('admin', 'client'), jobController.closeJob); // Route to close a specific job
module.exports = router;