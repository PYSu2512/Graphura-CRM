const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/project.controller');
const { requireUser } = require('../middleware/auth');

// /api/management/projects
router.get('/form-data',           requireUser, ctrl.getFormData);
router.get('/',                    requireUser, ctrl.listProjects);
router.post('/',                   requireUser, ctrl.createProject);
router.get('/:id',                 requireUser, ctrl.getProject);
router.put('/:id',                 requireUser, ctrl.updateProject);
router.delete('/:id',              requireUser, ctrl.deleteProject);
router.post('/:id/updates',        requireUser, ctrl.addUpdate);
router.post('/:id/complete',       requireUser, ctrl.markCompleted);

module.exports = router;
