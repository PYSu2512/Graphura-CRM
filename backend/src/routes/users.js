const express = require('express');
const userController = require('../controllers/user.controller');
const { createUserSchema, departmentLoginSchema, setupAccountSchema, setupBankDetailsSchema ,updateBankDetailsSchema } = require('../validators/user.validator');
//const { createUserSchema, departmentLoginSchema, setupAccountSchema, updateBankDetailsSchema } = require('../validators/user.validator');
const validate = require('../middleware/validate');
const { requireAdmin, requireAuth, requireUser } = require('../middleware/auth');

const router = express.Router();

router.get('/meta/role-department-map', requireAdmin, userController.getRoleDepartmentMap);
router.get('/departments', requireAdmin, userController.getDepartments);
router.post('/login', validate(departmentLoginSchema, 'body'), userController.loginUser);
router.get('/', requireAuth, userController.getUsers);
router.get('/stats', requireAuth, userController.getUserStats);
router.get('/profile', requireUser, userController.getCurrentUserProfile);
router.get('/me', requireUser, userController.getCurrentUserProfile);
router.post('/', requireAdmin, validate(createUserSchema, 'body'), userController.createUser);

// Account setup (password update) for department users
router.patch('/setup-account', requireUser, validate(setupAccountSchema, 'body'), userController.setupAccount);
// Account setup (bank details) for department users
router.patch('/bank-details', requireUser, validate(setupBankDetailsSchema, 'body'), userController.setupBankDetails);

// Bank details setup for department users
router.patch('/update-bank-details', requireUser, validate(updateBankDetailsSchema, 'body'), userController.updateBankDetails);

module.exports = router;
