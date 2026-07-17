const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');

function assertParticipant(swap, userId) {
  const ok = [swap.fromUser.toString(), swap.toUser.toString()].includes(userId.toString());
  if (!ok) {
    const err = new Error('You are not part of this swap conversation');
    err.statusCode = 403;
    throw err;
  }
}

// @route GET /api/chat/:swapRequestId — message history (used on page load; live messages come via Socket.IO)
const getMessages = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.swapRequestId);
  if (!swap) {
    res.status(404);
    throw new Error('Swap request not found');
  }
  assertParticipant(swap, req.user._id);

  const messages = await Message.find({ swapRequest: req.params.swapRequestId })
    .sort('createdAt')
    .populate('sender', 'name avatarUrl');

  res.json({ success: true, messages });
});

// @route POST /api/chat/:swapRequestId — REST fallback if a client can't hold a socket open
const sendMessage = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.swapRequestId);
  if (!swap) {
    res.status(404);
    throw new Error('Swap request not found');
  }
  assertParticipant(swap, req.user._id);

  const message = await Message.create({
    swapRequest: req.params.swapRequestId,
    sender: req.user._id,
    text: req.body.text,
  });
  const populated = await message.populate('sender', 'name avatarUrl');

  req.app.get('io')?.to(`swap:${req.params.swapRequestId}`).emit('chat:message', populated);

  res.status(201).json({ success: true, message: populated });
});

module.exports = { getMessages, sendMessage };
