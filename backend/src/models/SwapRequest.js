const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    itemOffered: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    itemWanted: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },

    // snapshot values at time of request, so later edits to a listing
    // don't retroactively change a historical request's fairness math
    valueOffered: { type: Number, required: true },
    valueWanted: { type: Number, required: true },
    cashTopUp: { type: Number, default: 0 }, // optional cash difference offered

    note: { type: String, maxlength: 500, default: '' },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },

    // Simple in-app notification flags
    seenByReceiver: { type: Boolean, default: false },
    seenBySender: { type: Boolean, default: true },

    respondedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

swapRequestSchema.index({ fromUser: 1, status: 1 });
swapRequestSchema.index({ toUser: 1, status: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
