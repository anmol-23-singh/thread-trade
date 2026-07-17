const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { createReviewSchema } = require('../utils/validators/swapValidators');

const router = express.Router();

router.post('/', protect, validate(createReviewSchema), createReview);
router.get('/user/:userId', getUserReviews);

module.exports = router;
