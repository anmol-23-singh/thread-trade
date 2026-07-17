const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');

// @route POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;
  if (!['User', 'Listing'].includes(targetType)) {
    res.status(400);
    throw new Error('targetType must be "User" or "Listing"');
  }
  const report = await Report.create({ reporter: req.user._id, targetType, targetId, reason });
  res.status(201).json({ success: true, report });
});

module.exports = { createReport };
