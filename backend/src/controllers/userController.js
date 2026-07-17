const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');


// @route GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});


// @route PATCH /api/users/me
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'avatarUrl'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  if (req.body.city || req.body.state) {
    updates.location = {
      ...req.user.location,
      city: req.body.city ?? req.user.location.city,
      state: req.body.state ?? req.user.location.state,
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});



// @route GET /api/users/:id — public profile (for viewing a swap partner)
const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name avatarUrl bio location ratingAverage ratingCount createdAt');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const listings = await Listing.find({ owner: user._id, status: 'Available' });
  const reviews = await Review.find({ reviewee: user._id }).populate('reviewer', 'name avatarUrl').sort('-createdAt').limit(10);

  res.json({ success: true, user, listings, reviews });
});



// @route POST /api/users/wishlist/:listingId
const toggleWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const user = req.user;
  const idx = user.wishlist.findIndex((id) => id.toString() === listingId);


  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }
    user.wishlist.push(listingId);
  }
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, wishlist: user.wishlist });
});


// @route GET /api/users/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    match: { status: 'Available' },
    populate: { path: 'owner', select: 'name location' },
  });
  res.json({ success: true, wishlist: user.wishlist });
});

module.exports = { getMe, updateMe, getPublicProfile, toggleWishlist, getWishlist };
