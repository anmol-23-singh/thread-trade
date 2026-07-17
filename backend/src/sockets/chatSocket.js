const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');
const { initIO } = require('./socketManager');
const logger = require('../config/logger');

function registerChatSocket(io) {
  initIO(io);

  // Every socket connection must present a valid access token —
  // mirrors the protect() REST middleware, but for the WS handshake.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.isBlocked) return next(new Error('Not authorized'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`Socket connected: ${socket.user.name} (${socket.id})`);

    // personal room, used for cross-cutting notifications (swap accepted, etc.)
    socket.join(`user:${userId}`);

    // --- Join a specific swap's chat thread ---
    socket.on('chat:join', async (swapRequestId) => {
      const swap = await SwapRequest.findById(swapRequestId);
      if (!swap) return;
      const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(userId);
      if (!isParticipant) return;
      socket.join(`swap:${swapRequestId}`);
    });

    // --- Send a message ---
    socket.on('chat:message', async ({ swapRequestId, text }) => {
      if (!text || !text.trim()) return;
      const swap = await SwapRequest.findById(swapRequestId);
      if (!swap) return;
      const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(userId);
      if (!isParticipant) return;

      const message = await Message.create({ swapRequest: swapRequestId, sender: userId, text: text.trim() });
      const populated = await message.populate('sender', 'name avatarUrl');

      io.to(`swap:${swapRequestId}`).emit('chat:message', populated);

      // also nudge the other party's personal room in case they're not in the chat view
      const otherUserId = swap.fromUser.toString() === userId ? swap.toUser.toString() : swap.fromUser.toString();
      io.to(`user:${otherUserId}`).emit('notification', {
        type: 'new_message',
        message: `New message from ${socket.user.name}`,
        link: `/swaps/${swapRequestId}`,
      });
    });

    // --- Typing indicator ---
    socket.on('chat:typing', ({ swapRequestId, isTyping }) => {
      socket.to(`swap:${swapRequestId}`).emit('chat:typing', { userId, isTyping });
    });

    // --- Seen status ---
    socket.on('chat:seen', async ({ swapRequestId }) => {
      await Message.updateMany(
        { swapRequest: swapRequestId, sender: { $ne: userId }, seenAt: null },
        { seenAt: new Date() }
      );
      socket.to(`swap:${swapRequestId}`).emit('chat:seen', { by: userId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
}

module.exports = registerChatSocket;
