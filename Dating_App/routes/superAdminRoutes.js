// routes/roleRoutes.js

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/SUPER_ADMIN/roleController');
const superAdminController = require('../controllers/SUPER_ADMIN/superAdminController');
const auditController = require('../controllers/SUPER_ADMIN/auditController');
const { Auth } = require('../auth/jwt');

router.post('/admin/roles/create', roleController.createRole);
router.get('/admin/roles', roleController.getAllRoles);
router.patch('/admin/roles/:roleId/update', roleController.updateRole);
router.delete('/admin/roles/:roleId', roleController.deleteRole);
router.post('/admin/roles/:roleId/assign-user', roleController.assignUserRole);
router.get('/audit/logs', Auth, auditController.getAuditLogs);
router.post('/signup',superAdminController.superAdminSignUp);
router.post('/login',superAdminController.loginSuperAdmin);
router.post('/addAdmin',superAdminController.addAdmin);
router.put('/updateAdmin/:adminId',superAdminController.updateAdmin);
router.delete('/deleteAdmin/:adminId',superAdminController.deleteAdmin);
router.get('/admin/list',superAdminController.listAdmins);
router.get('/admin/settings',superAdminController.getSettings);
 router.put('/admin/settings/:key', superAdminController.updateSettings);
router.get('/auditLogs',auditController.getAuditLogs);

module.exports = router;
//