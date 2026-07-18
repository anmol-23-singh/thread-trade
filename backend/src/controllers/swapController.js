const asyncHandler = require('express-async-handler');
const SwapRequest = require('../models/SwapRequest');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { getIO } = require('../sockets/socketManager');

// Suggests whether a swap is value-fair: within 15% (or ₹150, whichever is
// larger) of each other, accounting for any cash top-up offered.
function isFairMatch(valueOffered, valueWanted, cashTopUp = 0) {
  const diff = Math.abs(valueWanted - (valueOffered + cashTopUp));
  const threshold = Math.max(150, valueWanted * 0.15);
  return diff <= threshold;
}

// @route POST /api/swaps
const createSwapRequest = asyncHandler(async (req, res) => {
  const { itemOffered, itemWanted, cashTopUp, note } = req.body;

  const [offered, wanted] = await Promise.all([Listing.findById(itemOffered), Listing.findById(itemWanted)]);

  if (!offered || !wanted) {
    res.status(404);
    throw new Error('One or both listings could not be found');
  }
  if (offered.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only offer items you own');
  }
  // Allow users to swap their own items for testing/testing flows as requested
  // if (wanted.owner.toString() === req.user._id.toString()) {
  //   res.status(400);
  //   throw new Error('You cannot swap for your own item');
  // }
  if (offered.status !== 'Available' || wanted.status !== 'Available') {
    res.status(409);
    throw new Error('Both items must be available to start a swap');
  }

  const swap = await SwapRequest.create({
    fromUser: req.user._id,
    toUser: wanted.owner,
    itemOffered,
    itemWanted,
    valueOffered: offered.estimatedValue,
    valueWanted: wanted.estimatedValue,
    cashTopUp: cashTopUp || 0,
    note,
    seenByReceiver: false,
  });

  offered.status = 'Pending';
  wanted.status = 'Pending';
  await Promise.all([offered.save(), wanted.save()]);

  const notification = await Notification.create({
    user: wanted.owner,
    type: 'swap_request',
    message: `${req.user.name} wants to swap for your "${wanted.title}"`,
    link: `/swaps/${swap._id}`,
  });
  getIO()?.to(`user:${wanted.owner}`).emit('notification', notification);

  res.status(201).json({
    success: true,
    swap,
    fairMatch: isFairMatch(swap.valueOffered, swap.valueWanted, swap.cashTopUp),
  });
});

// @route GET /api/swaps/mine?type=incoming|outgoing
const getMySwaps = asyncHandler(async (req, res) => {
  const { type = 'all' } = req.query;
  const filter =
    type === 'incoming'
      ? { toUser: req.user._id }
      : type === 'outgoing'
      ? { fromUser: req.user._id }
      : { $or: [{ toUser: req.user._id }, { fromUser: req.user._id }] };

  const swaps = await SwapRequest.find(filter)
    .sort('-createdAt')
    .populate('fromUser toUser', 'name avatarUrl location')
    .populate('itemOffered itemWanted', 'title images estimatedValue status');

  res.json({ success: true, swaps });
});

// @route GET /api/swaps/:id
const getSwapById = asyncHandler(async (req, res) => {
  const swap = await SwapRequest.findById(req.params.id)
    .populate('fromUser toUser', 'name avatarUrl location')
    .populate('itemOffered itemWanted');

  if (!swap) {
    res.status(404);
    throw new Error('Swap request not found');
  }
  assertParticipant(swap, req.user);

  res.json({ success: true, swap, fairMatch: isFairMatch(swap.valueOffered, swap.valueWanted, swap.cashTopUp) });
});

// @route PATCH /api/swaps/:id — accept / reject / cancel / complete
const respondToSwap = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const swap = await SwapRequest.findById(req.params.id).populate('itemOffered itemWanted');
  if (!swap) {
    res.status(404);
    throw new Error('Swap request not found');
  }
  assertParticipant(swap, req.user);

  if (swap.status !== 'pending' && ['accept', 'reject'].includes(action)) {
    res.status(409);
    throw new Error(`Swap request is already "${swap.status}"`);
  }

  const isReceiver = swap.toUser.toString() === req.user._id.toString();

  if (action === 'accept') {
    if (!isReceiver) {
      res.status(403);
      throw new Error('Only the receiving user can accept a swap request');
    }
    swap.status = 'accepted';
    swap.respondedAt = new Date();
    swap.itemOffered.status = 'Swapped';
    swap.itemWanted.status = 'Swapped';
    await Promise.all([swap.itemOffered.save(), swap.itemWanted.save()]);
    await notifyOtherParty(swap, req.user, 'swap_accepted', `${req.user.name} accepted your swap request`);
  } else if (action === 'reject') {
    if (!isReceiver) {
      res.status(403);
      throw new Error('Only the receiving user can reject a swap request');
    }
    swap.status = 'rejected';
    swap.respondedAt = new Date();
    await releaseItems(swap);
    await notifyOtherParty(swap, req.user, 'swap_rejected', `${req.user.name} declined your swap request`);
  } else if (action === 'cancel') {
    swap.status = 'cancelled';
    await releaseItems(swap);
  } else if (action === 'complete') {
    if (swap.status !== 'accepted') {
      res.status(409);
      throw new Error('Only an accepted swap can be marked complete');
    }
    swap.status = 'completed';
    swap.completedAt = new Date();
  }

  await swap.save();
  res.json({ success: true, swap });
});

async function releaseItems(swap) {
  await Listing.updateMany(
    { _id: { $in: [swap.itemOffered, swap.itemWanted] }, status: 'Pending' },
    { status: 'Available' }
  );
}

async function notifyOtherParty(swap, actingUser, type, message) {
  const recipient = swap.fromUser.toString() === actingUser._id.toString() ? swap.toUser : swap.fromUser;
  const notification = await Notification.create({ user: recipient, type, message, link: `/swaps/${swap._id}` });
  getIO()?.to(`user:${recipient}`).emit('notification', notification);
}

function assertParticipant(swap, user) {
  const isParticipant =
    swap.fromUser._id?.toString() === user._id.toString() || swap.toUser._id?.toString() === user._id.toString() ||
    swap.fromUser.toString?.() === user._id.toString() || swap.toUser.toString?.() === user._id.toString();
  if (!isParticipant && user.role !== 'admin') {
    const err = new Error('You are not a participant in this swap');
    err.statusCode = 403;
    throw err;
  }
}

module.exports = { createSwapRequest, getMySwaps, getSwapById, respondToSwap };
