// routes/adminRoutes.js
// const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { Auth } = require('../auth/jwt');

const adminController         = require('../controllers/ADMIN/adminController');
const adminUserController     = require('../controllers/ADMIN/adminUserController');
const adminProfileController  = require('../controllers/ADMIN/adminProfileController');
const adminAnalyticsController= require('../controllers/ADMIN/adminAnalyticsController');
const adminModerationController = require('../controllers/ADMIN/adminModerationController');
const adminPremiumController  = require('../controllers/ADMIN/adminPremiumController');
const adminSecurityController = require('../controllers/ADMIN/adminSecurityController');
const adminConfigController   = require('../controllers/ADMIN/adminConfigController');
const adminFinanceController  = require('../controllers/ADMIN/adminFinanceController');
const adminSupportController  = require('../controllers/ADMIN/adminSupportController');


// Upload middleware (for CSV uploads)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


/* ------------------------- 🌟 Admin Authentication ------------------------- */
router.post('/signup', adminController.adminSignUp);
router.post('/login', adminController.adminLogin);
router.put('/:adminId/update', adminController.updateAdmin);

/* ------------------------- 🔐 User Management ------------------------- */
router.get('/users', adminUserController.getAllUsers);
router.patch('/users/:userId/suspend', adminUserController.suspendUser);
router.patch('/users/:userId/verify', adminUserController.verifyUser);
router.get('/users/:userId/verification-status', adminUserController.getVerificationStatus);
router.post('/users/:userId/verify-manually', adminUserController.manualVerification);
router.get('/users/:userId/reports', adminUserController.getUserReports);
router.get('/users/:userId/login-history', adminUserController.getLoginHistory);
router.get('/users/search', adminUserController.searchUsers); // Keyword-based search
router.get('/users/filter', adminUserController.filterUsers); // Filtering by status (Active, Banned, Pending)
router.get('/users/sort', adminUserController.sortUsers); // Sorting by Join Date, Last Active, Verification Status
router.post('/users/approve-all', adminUserController.approveAllPendingUsers);
router.post('/users/ban-multiple', adminUserController.banMultipleUsers);
router.get('/users/export', adminUserController.exportToCSV);
router.get('/users/:userId', adminUserController.getUserById);
router.delete('/users/:userId/delete', adminUserController.deleteUser);
/* ---------------------- 👤 Profile Management ------------------------ */
router.post('/profiles/create',Auth, adminProfileController.createProfile);
router.post('/profiles/batch-upload',Auth, upload.single('csv'), adminProfileController.batchUploadProfiles);
router.put('/profiles/update/:profileId',Auth, adminProfileController.updateProfile);
router.delete('/profiles/delete/:profileId', Auth,adminProfileController.deleteProfile);
router.get('/getprofiles', Auth, adminProfileController.getProfiles);
router.get('/admin/users/fake',Auth,adminProfileController.getFakeUsers);
router.get('/admin/users/real',Auth,adminProfileController.getRealUsers);
// router.get('/admin/users/reported', Auth, isAdminOrSuperAdmin,getReportedUsers);
router.get('/admin/users/reported', Auth,adminProfileController.getReportedUsers);

/* --------------------- 📊 Analytics & Reporting ---------------------- */
router.get('/analytics/overview', adminAnalyticsController.getOverviewStats);
router.get('/analytics/daily-signups',    adminAnalyticsController.dailySignups);
router.get('/analytics/revenue-trend',   adminAnalyticsController.revenueTrend);

/* ----------------------- ⚔️ Moderation Tools ------------------------ */
router.get('/moderation/reports', adminModerationController.getAllReports);
router.patch('/moderation/reports/:reportId/resolve', adminModerationController.resolveReport);
router.delete('/moderation/messages/:messageId', adminModerationController.deleteMessage);
router.get  ('/moderation/actions',       adminModerationController.listModerationActions);
router.post ('/moderation/actions/:id',   adminModerationController.overrideModeration);

/* ---------------------- 💎 Premium Features -------------------------- */
// router.get('/premium/subscriptions',Auth, adminPremiumController.getSubscriptions);
// router.post('/premium/plans', adminPremiumController.createPlan);
// router.patch('/premium/users/:userId', adminPremiumController.updateUserPremium);
// router.get  ('/premium/subscriptions',   adminPremiumController.listSubscriptions);
// router.patch('/premium/subscription/:id/cancel',adminPremiumController.cancelSubscription);

/* ----------------------- 🛡️ Security Settings ----------------------- */
router.post('/security/block', adminSecurityController.blockUser);
router.post('/security/unblock', adminSecurityController.unblockUser);
router.get('/security/:userId/blocked', adminSecurityController.getBlockedUsers);

/* ------------------- ⚙️ System Configurations ---------------------- */
router.get('/config/settings', adminConfigController.getSettings);
router.patch('/config/settings/:key', adminConfigController.updateSetting);

/* ----------------------- 💰 Finance & Revenue ----------------------- */
router.get('/finance/revenue', adminFinanceController.getRevenue);
router.post('/finance/refund', adminFinanceController.processRefund);

/* ------------------------ 📞 Support & FAQ -------------------------- */
router.get('/support/tickets', adminSupportController.getTickets);
router.patch('/support/ticket/:ticketId/resolve', adminSupportController.resolveTicket);
router.post('/support/faq', adminSupportController.manageFaq);

/*------------------------Flagged Content-------------------------------------*/
// router.get  ('/flagged-contents',adminFinanceController.listFlagged);
// router.patch('/flagged-contents/:id',adminFinanceController.updateFlagged);

/*-------------------------Login Session Management-----------------------------*/
// router.get  ('/users/:id/sessions',adminSessionController.getUserSessions);
// router.post ('/users/:id/logout-all',adminSessionController.logoutAllSessions);

/*--------------------------Notifications---------------------------------------*/
// router.post('/notifications/send', adminNotificationCotroller.sendNotification);

module.exports = router;

