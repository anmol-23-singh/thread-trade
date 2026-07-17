const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// one review per reviewer per swap, prevents duplicate-review spam
reviewSchema.index({ swapRequest: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
