const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const SwapRequest = require('../models/SwapRequest');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/audit');
const { cloudinary } = require('../config/cloudinary');

// @route GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalListings, activeListings, totalSwaps, completedSwaps, openReports] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'Available' }),
    SwapRequest.countDocuments(),
    SwapRequest.countDocuments({ status: 'completed' }),
    Report.countDocuments({ status: 'open' }),
  ]);

  const conversionRate = totalSwaps ? Math.round((completedSwaps / totalSwaps) * 100) : 0;

  // last 6 months of signups, for a simple growth chart
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const signupTrend = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: { totalUsers, totalListings, activeListings, totalSwaps, completedSwaps, conversionRate, openReports },
    signupTrend,
  });
});

// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success: true, users });
});

// @route PATCH /api/admin/users/:id/block
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isBlocked = !user.isBlocked;
  user.blockReason = user.isBlocked ? req.body.reason || 'Violation of platform guidelines' : '';
  if (user.isBlocked) user.refreshTokens = []; // force-logout everywhere
  await user.save({ validateBeforeSave: false });

  await logAudit(req.user._id, user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED', 'User', user._id, {}, req.ip);

  res.json({ success: true, user: { id: user._id, isBlocked: user.isBlocked } });
});


// @route GET /api/admin/listings
const getAllListingsAdmin = asyncHandler(async (req, res) => {
  const listings = await Listing.find().populate('owner', 'name email').sort('-createdAt');
  res.json({ success: true, listings });
});


// @route PATCH /api/admin/listings/:id/flag
const flagListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { isFlagged: true, flagReason: req.body.reason || 'Flagged by admin review' },
    { new: true }
  );
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  await logAudit(req.user._id, 'LISTING_FLAGGED', 'Listing', listing._id, { reason: req.body.reason }, req.ip);
  res.json({ success: true, listing });
});


// @route DELETE /api/admin/listings/:id
const removeListingAdmin = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  await Promise.all(listing.images.map((img) => img.publicId && cloudinary.uploader.destroy(img.publicId)));
  await listing.deleteOne();
  await logAudit(req.user._id, 'LISTING_REMOVED', 'Listing', listing._id, { title: listing.title }, req.ip);
  res.json({ success: true, message: 'Listing removed' });
});


// @route GET /api/admin/reports
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ status: 'open' }).populate('reporter', 'name email').sort('-createdAt');
  res.json({ success: true, reports });
});


// @route PATCH /api/admin/reports/:id
const resolveReport = asyncHandler(async (req, res) => {
  const { status, resolutionNote } = req.body; // status: 'reviewed' | 'dismissed'
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolutionNote, resolvedBy: req.user._id },
    { new: true }
  );
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  await logAudit(req.user._id, 'REPORT_RESOLVED', 'Report', report._id, { status }, req.ip);
  res.json({ success: true, report });
});


// @route GET /api/admin/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().populate('actor', 'name email').sort('-createdAt').limit(200);
  res.json({ success: true, logs });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  getAllListingsAdmin,
  flagListing,
  removeListingAdmin,
  getReports,
  resolveReport,
  getAuditLogs,
};
