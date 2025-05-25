import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const BUSINESS_DB_URI = process.env.MONGODB_BUSINESS_URI || MONGODB_URI?.replace(/\/([^/]+)$/, '/GiftSpark_Business');

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI);
console.log('Business database URI:', BUSINESS_DB_URI);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  businessConn: Connection | null;
  businessPromise: Promise<Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    businessConn: null,
    businessPromise: null
  };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new MongoDB connection');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function connectBusinessDB() {
  if (cached.businessConn) {
    console.log('Using cached Business MongoDB connection');
    return cached.businessConn;
  }

  if (!cached.businessPromise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new Business MongoDB connection');
    cached.businessPromise = (async () => {
      const connection = await mongoose.createConnection(BUSINESS_DB_URI!, opts);
      console.log('Business MongoDB connected successfully');
      return connection;
    })();
  }

  try {
    cached.businessConn = await cached.businessPromise;
  } catch (e) {
    console.error('Business MongoDB connection error:', e);
    cached.businessPromise = null;
    throw e;
  }

  return cached.businessConn;
}

export { connectDB, connectBusinessDB }; 