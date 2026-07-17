const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Clothing listing photos land in a dedicated Cloudinary folder,
// resized on upload so oversized phone photos don't bloat storage.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'thread-trade/listings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5MB each, up to 6 photos per listing
});

module.exports = { cloudinary, upload };
