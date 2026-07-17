const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000, trim: true },
    seenAt: { type: Date, default: null }, // null = unseen, powers "seen" ticks
  },
  { timestamps: true }
);

messageSchema.index({ swapRequest: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
