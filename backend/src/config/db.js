import dns from 'node:dns';
import mongoose from 'mongoose';

const DEFAULT_DATABASE_NAME = 'support_ticket_tracker';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is required. Set it in backend/.env before starting the server.');
  }

  const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);
  if (dnsServers?.length) {
    try {
      dns.setServers(dnsServers);
    } catch {
      throw new Error('MONGODB_DNS_SERVERS must contain valid DNS server addresses.');
    }
  }

  let connectionOptions = {};
  try {
    const parsedUri = new URL(uri);
    if (!['mongodb:', 'mongodb+srv:'].includes(parsedUri.protocol)) {
      throw new Error();
    }
    if (!parsedUri.pathname || parsedUri.pathname === '/') {
      connectionOptions = { dbName: DEFAULT_DATABASE_NAME };
    }
  } catch {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string.');
  }

  try {
    const conn = await mongoose.connect(uri, connectionOptions);
    console.log(`MongoDB connected successfully to ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    throw new Error('MongoDB connection failed. Check MONGODB_URI, Atlas network access, and database credentials.', {
      cause: error,
    });
  }
};

export default connectDB;
