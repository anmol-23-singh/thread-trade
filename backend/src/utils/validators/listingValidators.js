const { z } = require('zod');

const CATEGORY = ['Shirt', 'Dress', 'Jacket', 'Jeans', 'Footwear', 'Accessory', 'Ethnic Wear', 'Kidswear', 'Other'];
const CONDITION = ['New with tags', 'Like New', 'Good', 'Fair'];
const GENDER = ['Men', 'Women', 'Unisex', 'Kids'];

const createListingSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(1000),
  category: z.enum(CATEGORY),
  tags: z.array(z.string().trim().toLowerCase()).max(10).optional(),
  brand: z.string().trim().max(60).optional(),
  size: z.string().trim().min(1).max(20),
  gender: z.enum(GENDER).optional(),
  condition: z.enum(CONDITION),
  estimatedValue: z.coerce.number().min(0).max(500000),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
});

const updateListingSchema = createListingSchema.partial();

const listQuerySchema = z.object({
  category: z.string().optional(),
  size: z.string().optional(),
  condition: z.string().optional(),
  gender: z.string().optional(),
  brand: z.string().optional(),
  city: z.string().optional(),
  minValue: z.coerce.number().optional(),
  maxValue: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(['newest', 'oldest', 'value_low', 'value_high']).default('newest'),
});

module.exports = { createListingSchema, updateListingSchema, listQuerySchema };
