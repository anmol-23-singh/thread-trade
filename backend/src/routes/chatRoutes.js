const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getMessages, sendMessage } = require('../controllers/chatController');
const { sendMessageSchema } = require('../utils/validators/swapValidators');

const router = express.Router();

router.use(protect);
router.get('/:swapRequestId', getMessages);
router.post('/:swapRequestId', validate(sendMessageSchema), sendMessage);

module.exports = router;
