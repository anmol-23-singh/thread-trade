const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('./logger');

// Forces Node to resolve DNS via Google/Cloudflare directly, which fixes
// the common Windows "querySrv ECONNREFUSED" issue with mongodb+srv:// URIs.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 no longer needs useNewUrlParser/useUnifiedTopology, kept here as a comment
      // for anyone pinning an older mongoose version.
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
