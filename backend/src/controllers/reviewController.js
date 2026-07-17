const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// @route POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { swapRequest: swapId, rating, comment } = req.body;

  const swap = await SwapRequest.findById(swapId);
  if (!swap) {
    res.status(404);
    throw new Error('Swap not found');
  }
  if (swap.status !== 'completed') {
    res.status(409);
    throw new Error('You can only review a completed swap');
  }
  const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(req.user._id.toString());
  if (!isParticipant) {
    res.status(403);
    throw new Error('You were not part of this swap');
  }
  const revieweeId = swap.fromUser.toString() === req.user._id.toString() ? swap.toUser : swap.fromUser;

  const review = await Review.create({
    swapRequest: swapId,
    reviewer: req.user._id,
    reviewee: revieweeId,
    rating,
    comment,
  });

  // recompute the reviewee's aggregate rating
  const stats = await Review.aggregate([
    { $match: { reviewee: review.reviewee } },
    { $group: { _id: '$reviewee', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await User.findByIdAndUpdate(revieweeId, {
      ratingAverage: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }

  res.status(201).json({ success: true, review });
});

// @route GET /api/reviews/user/:userId
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate('reviewer', 'name avatarUrl')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});

module.exports = { createReview, getUserReviews };
