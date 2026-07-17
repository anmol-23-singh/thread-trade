const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const { cloudinary } = require('../config/cloudinary');
const { logAudit } = require('../utils/audit');

// @route GET /api/listings — search + filter + paginate
const getListings = asyncHandler(async (req, res) => {
  const { category, size, condition, gender, brand, city, minValue, maxValue, search, page, limit, sort } = req.query;

  const filter = { status: 'Available' };
  if (category) filter.category = category;
  if (size) filter.size = size;
  if (condition) filter.condition = condition;
  if (gender) filter.gender = gender;
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (minValue || maxValue) {
    filter.estimatedValue = {};
    if (minValue) filter.estimatedValue.$gte = minValue;
    if (maxValue) filter.estimatedValue.$lte = maxValue;
  }
  if (search) filter.$text = { $search: search };

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    value_low: { estimatedValue: 1 },
    value_high: { estimatedValue: -1 },
  };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Listing.find(filter).sort(sortMap[sort]).skip(skip).limit(limit).populate('owner', 'name location ratingAverage'),
    Listing.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @route GET /api/listings/nearby?lng=&lat=&maxDistanceKm=
const getNearbyListings = asyncHandler(async (req, res) => {
  const { lng, lat, maxDistanceKm = 25 } = req.query;
  if (!lng || !lat) {
    res.status(400);
    throw new Error('lng and lat query params are required');
  }

  const items = await Listing.find({
    status: 'Available',
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(maxDistanceKm) * 1000,
      },
    },
  }).limit(30).populate('owner', 'name location');

  res.json({ success: true, items });
});

// @route GET /api/listings/:id
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true }).populate(
    'owner',
    'name location ratingAverage ratingCount avatarUrl'
  );
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  res.json({ success: true, listing });
});

// @route POST /api/listings
const createListing = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

  const listing = await Listing.create({
    ...req.body,
    owner: req.user._id,
    images,
    location: { city: req.body.city, state: req.body.state },
  });

  res.status(201).json({ success: true, listing });
});

// @route PATCH /api/listings/:id
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only edit your own listings');
  }

  Object.assign(listing, req.body);
  if (req.body.city || req.body.state) {
    listing.location.city = req.body.city ?? listing.location.city;
    listing.location.state = req.body.state ?? listing.location.state;
  }
  if (req.files && req.files.length) {
    listing.images.push(...req.files.map((f) => ({ url: f.path, publicId: f.filename })));
  }

  await listing.save();
  res.json({ success: true, listing });
});

// @route DELETE /api/listings/:id
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  const isOwner = listing.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only remove your own listings');
  }

  // clean up Cloudinary assets so storage doesn't leak
  await Promise.all(listing.images.map((img) => img.publicId && cloudinary.uploader.destroy(img.publicId)));
  await listing.deleteOne();

  if (!isOwner) {
    await logAudit(req.user._id, 'LISTING_REMOVED_BY_ADMIN', 'Listing', listing._id, { title: listing.title }, req.ip);
  }

  res.json({ success: true, message: 'Listing removed' });
});

// @route GET /api/listings/mine
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).sort('-createdAt');
  res.json({ success: true, listings });
});

module.exports = {
  getListings,
  getNearbyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
};
