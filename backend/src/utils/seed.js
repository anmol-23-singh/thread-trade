require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');
const logger = require('../config/logger');

const demoUsers = [
  { name: 'Ananya Rao', email: 'ananya@example.com', password: 'Swap_123', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
  { name: 'Devika Menon', email: 'devika@example.com', password: 'Swap_123', location: { city: 'Kochi', state: 'Kerala' } },
  { name: 'Rohit Malhotra', email: 'rohit@example.com', password: 'Swap_123', location: { city: 'Lucknow', state: 'Uttar Pradesh' } },
  { name: 'Admin User', email: 'admin@example.com', password: 'Swap_123', role: 'admin', location: { city: 'Lucknow', state: 'Uttar Pradesh' } },
  { name: 'Vipin Singh', email: 'anitamaxxwin0909@gmail.com', password: 'Swap_123', location: { city: 'Varanasi', state: 'Uttar Pradesh' } },
];

async function run() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Listing.deleteMany({})]);

  const users = await User.create(demoUsers);
  const [ananya, devika, rohit, admin, vipin] = users;

  await Listing.create([
    {
      owner: devika._id,
      title: "Denim Jacket — Levi's Trucker",
      description: 'Barely worn, classic trucker cut, one small tag repair.',
      category: 'Jacket',
      brand: "Levi's",
      size: 'M',
      gender: 'Unisex',
      condition: 'Like New',
      estimatedValue: 1400,
      tags: ['denim', 'vintage'],
      location: { city: 'Kochi', state: 'Kerala' },
      images: [],
    },
    {
      owner: devika._id,
      title: 'Floral Wrap Dress',
      description: 'Worn twice, light floral print, machine washable.',
      category: 'Dress',
      brand: 'Zara',
      size: 'S',
      gender: 'Women',
      condition: 'Good',
      estimatedValue: 900,
      tags: ['floral', 'summer'],
      location: { city: 'Kochi', state: 'Kerala' },
      images: [],
    },
    {
      owner: rohit._id,
      title: 'Formal Oxford Shirt',
      description: 'Ironed and stored, no stains, slim collar.',
      category: 'Shirt',
      brand: 'Van Heusen',
      size: 'L',
      gender: 'Men',
      condition: 'New with tags',
      estimatedValue: 700,
      tags: ['formal', 'office'],
      location: { city: 'Lucknow', state: 'Uttar Pradesh' },
      images: [],
    },
    {
      owner: ananya._id,
      title: 'Handknit Wool Scarf',
      description: 'Soft merino blend, hand-knitted, unused.',
      category: 'Accessory',
      brand: 'Local Artisan',
      size: 'One Size',
      gender: 'Unisex',
      condition: 'Like New',
      estimatedValue: 350,
      tags: ['winter', 'handmade'],
      location: { city: 'Varanasi', state: 'Uttar Pradesh' },
      images: [],
    },
    {
      owner: vipin._id,
      title: 'crazy shirts',
      description: 'have this in my priority',
      category: 'Shirt',
      brand: 'Versace',
      size: '32',
      gender: 'Men',
      condition: 'Like New',
      estimatedValue: 4000,
      tags: ['shirts', 'crazy'],
      location: { city: 'Varanasi', state: 'Uttar Pradesh' },
      images: [],
    },
    {
      owner: vipin._id,
      title: 'crazy shoes',
      description: 'Brand new kicks',
      category: 'Footwear',
      brand: 'Nike',
      size: '10',
      gender: 'Unisex',
      condition: 'New with tags',
      estimatedValue: 8000,
      tags: ['shoes', 'kicks'],
      location: { city: 'Varanasi', state: 'Uttar Pradesh' },
      images: [],
    },
    {
      owner: vipin._id,
      title: 'armandoooo shirts',
      description: 'Cool armandoooo shirts',
      category: 'Shirt',
      brand: 'Armani',
      size: 'M',
      gender: 'Men',
      condition: 'Good',
      estimatedValue: 2500,
      tags: ['shirt', 'armani'],
      location: { city: 'Varanasi', state: 'Uttar Pradesh' },
      images: [],
    },
    {
      owner: vipin._id,
      title: 'cool winterwear',
      description: 'cool winterwear',
      category: 'Jacket',
      brand: 'Moncler',
      size: 'L',
      gender: 'Unisex',
      condition: 'Like New',
      estimatedValue: 5000,
      tags: ['winterwear', 'jacket'],
      location: { city: 'Varanasi', state: 'Uttar Pradesh' },
      images: [],
    },
    {
      owner: vipin._id,
      title: 'jeans',
      description: 'Classic blue jeans',
      category: 'Jeans',
      brand: 'Levis',
      size: '34',
      gender: 'Men',
      condition: 'Good',
      estimatedValue: 1200,
      tags: ['jeans', 'levis'],
      location: { city: 'Varanasi', state: 'Uttar Pradesh' },
      images: [],
    },
  ]);

  logger.info(`Seeded ${users.length} users and 9 listings.`);
  logger.info('Demo logins (password: Swap_123 for all):');
  logger.info('  - Vipin Singh: anitamaxxwin0909@gmail.com');
  logger.info('  - Ananya Rao: ananya@example.com');
  logger.info('  - Devika Menon: devika@example.com');
  logger.info('  - Rohit Malhotra: rohit@example.com');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
