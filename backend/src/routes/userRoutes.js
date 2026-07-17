const express = require('express');
const { protect } = require('../middleware/auth');
const { getMe, updateMe, getPublicProfile, toggleWishlist, getWishlist } = require('../controllers/userController');

const router = express.Router();

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:listingId', protect, toggleWishlist);
router.get('/:id', getPublicProfile); // public — browsing a swap partner's profile

module.exports = router;
