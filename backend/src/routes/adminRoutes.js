const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  getAllListingsAdmin,
  flagListing,
  removeListingAdmin,
  getReports,
  resolveReport,
  getAuditLogs,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin')); // every route below requires an authenticated admin

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.patch('/users/:id/block', toggleBlockUser);

router.get('/listings', getAllListingsAdmin);
router.patch('/listings/:id/flag', flagListing);
router.delete('/listings/:id', removeListingAdmin);

router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);

router.get('/audit-logs', getAuditLogs);

module.exports = router;
