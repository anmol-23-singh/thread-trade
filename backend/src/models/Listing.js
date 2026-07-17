const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 1000 },

    category: {
      type: String,
      required: true,
      enum: ['Shirt', 'Dress', 'Jacket', 'Jeans', 'Footwear', 'Accessory', 'Ethnic Wear', 'Kidswear', 'Other'],
    },
    tags: [{ type: String, trim: true, lowercase: true }], // free-form tags, e.g. "vintage", "streetwear"

    brand: { 
      type: String,
       trim: true,
        default: 'Unbranded' },

    size: {
       type: String,
        required: true,
        trim: true },
        
    gender: { type: String, enum: ['Men', 'Women', 'Unisex', 'Kids'], default: 'Unisex' },
    condition: {
      type: String,
      required: true,
      enum: ['New with tags', 'Like New', 'Good', 'Fair'],
    },

    images: [
      {
        url: {
           type: String,
            required: true },

        publicId: {
           type: String }, // Cloudinary public_id, needed to delete on removal
      },
    ],

    estimatedValue: {
       type: Number, 
       required: true,
        min: 0 },

    location: {
      city: {
         type: String, 
         trim: true },

      state: { 

        type: String,
         trim: true },

      coordinates: {

        type: {

           type: String,
            enum: ['Point'],
             default: 'Point' },
             
        coordinates: { 

          type: [Number],
           default: [0, 0] },
      },
    },

    status: {

      type: String,
      enum: ['Available', 'Pending', 'Swapped', 'Removed'],
      default: 'Available',
      index: true,
    },

    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: '' },

    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search-with-debouncing on the frontend
listingSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ category: 1, size: 1, condition: 1, status: 1 }); // compound index for filter combos
listingSchema.index({ createdAt: -1 }); // for pagination sorted by newest

module.exports = mongoose.model('Listing', listingSchema);
