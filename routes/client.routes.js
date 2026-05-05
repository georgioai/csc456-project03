const express = require('express');
const router = express.Router();// create a new router object 

//importing the functions to protect some routes
const requireAuth = require('../middleware/auth.middleware');//make sure user have a token
const requireRole = require('../middleware/role.middleware');//make sure of the role

const clientController = require('../controllers/client.controller'); // Import the client controller

router.get('/', requireAuth, requireRole('admin'), clientController.getClients); // Route to get all clients
router.get('/new',requireAuth, requireRole('admin'), clientController.newClientForm);//opens the form to create a new client
router.post('/new',requireAuth, requireRole('admin'), clientController.createClient);//submit the form to create a new client
router.get('/show/:id',requireAuth, requireRole('admin', 'client'), clientController.showClient);//shows the details of the desiired client
router.get('/edit/:id',requireAuth, requireRole('admin'), clientController.editClientForm);//get the edit form
router.post('/edit/:id',requireAuth, requireRole('admin'), clientController.updateClient);//submit the edit form
router.post('/delete/:id',requireAuth, requireRole('admin'), clientController.deleteClient);//delete the client with the specified id

module.exports = router;