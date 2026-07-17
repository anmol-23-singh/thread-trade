const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'new_message', 'new_review', 'listing_removed'],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: '' }, // frontend route to deep-link to, e.g. /swaps/:id
    isRead: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
