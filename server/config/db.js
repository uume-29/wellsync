const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Ensure server/.env is loaded reliably regardless of working directory
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
  }
}

// Configure DNS resolution for MongoDB Atlas SRV records
// In Windows/Node environments, default DNS may be loopback (127.0.0.1) which rejects querySrv lookups
try {
  const currentServers = dns.getServers();
  if (!currentServers || currentServers.length === 0 || currentServers.includes('127.0.0.1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (dnsErr) {
  // Continue if environment restricts custom DNS configuration
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[MongoDB Error] MONGO_URI is not defined in environment variables. Please check server/.env.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15-second timeout for cloud cluster handshake
    });

    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(`[${isAtlas ? 'MongoDB Atlas' : 'MongoDB'}] Connected successfully to cluster host: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    // Sanitize error message to prevent logging connection strings, passwords, or credentials
    let safeMessage = error.message || 'Database connection error';
    if (mongoUri) {
      safeMessage = safeMessage.replace(mongoUri, '[REDACTED_MONGO_URI]');
    }
    safeMessage = safeMessage.replace(/:([^:@]+)@/, ':***@');

    console.error(`[MongoDB Connection Error] Failed to connect to MongoDB using MONGO_URI.`);
    console.error(`[MongoDB Error Details] ${safeMessage}`);
    if (error.code) {
      console.error(`[MongoDB Error Code] ${error.code}`);
    }
    console.error('[MongoDB Startup Aborted] Server startup stopped. Fix connection string or network access in server/.env.');

    // Stop startup instead of silently falling back to temporary in-memory storage
    process.exit(1);
  }
};

module.exports = connectDB;
