const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createSwapRequest, getMySwaps, getSwapById, respondToSwap } = require('../controllers/swapController');
const { createSwapRequestSchema, respondSwapRequestSchema } = require('../utils/validators/swapValidators');

const router = express.Router();

router.use(protect); // every swap route requires auth

router.post('/', validate(createSwapRequestSchema), createSwapRequest);
router.get('/mine', getMySwaps);
router.get('/:id', getSwapById);
router.patch('/:id', validate(respondSwapRequestSchema), respondToSwap);

module.exports = router;
