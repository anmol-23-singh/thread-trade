const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../config/cloudinary');
const {
  getListings,
  getNearbyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
} = require('../controllers/listingController');
const { createListingSchema, updateListingSchema, listQuerySchema } = require('../utils/validators/listingValidators');

const router = express.Router();

router.get('/', validate(listQuerySchema, 'query'), getListings);
router.get('/nearby', getNearbyListings);
router.get('/mine', protect, getMyListings);
router.get('/:id', optionalAuth, getListingById);

router.post('/', protect, upload.array('images', 6), validate(createListingSchema), createListing);
router.patch('/:id', protect, upload.array('images', 6), validate(updateListingSchema), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
