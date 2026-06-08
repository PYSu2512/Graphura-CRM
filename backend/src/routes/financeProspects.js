const express = require('express');
const router = express.Router();
const financeProspectController = require('../controllers/financeProspect.controller');
const { requireUser } = require('../middleware/auth');
const upload = require('../middleware/upload');
const addToCrmCollection = require('../middleware/cloudinaryCollection');

// Base: /api/finance/prospects
router.get('/', requireUser, financeProspectController.getProspects);
router.post('/:prospectId/send', requireUser, upload.single('tcFile'), addToCrmCollection, financeProspectController.sendToClient);

module.exports = router;
