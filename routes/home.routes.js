const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/auth.middleware');

const homeController = require('../controllers/home.controller');

router.get('/', homeController.getHome);
router.get('/dashboard',requireAuth, homeController.getDashboard);

module.exports = router;