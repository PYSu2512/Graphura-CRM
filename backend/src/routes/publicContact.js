const express = require('express');
const router = express.Router();
const publicContactController = require('../controllers/publicContact.controller');

router.post('/contact', publicContactController.submitContactQuery);

module.exports = router;
