const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ID format',
});

const createSwapRequestSchema = z.object({
  itemOffered: objectId,
  itemWanted: objectId,
  cashTopUp: z.coerce.number().min(0).max(50000).optional().default(0),
  note: z.string().trim().max(500).optional().default(''),
});

const respondSwapRequestSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel', 'complete']),
});

const sendMessageSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty').max(2000),
});

const createReviewSchema = z.object({
  swapRequest: objectId,
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().max(500).optional().default(''),
});

module.exports = { createSwapRequestSchema, respondSwapRequestSchema, sendMessageSchema, createReviewSchema };
