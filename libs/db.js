import mongoose from 'mongoose';

const globalForMongoose = globalThis;

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = { connection: null, promise: null };
}

export function normalizeMongoUri(uri) {
  const queryIndex = uri.indexOf('?');
  const connectionString = queryIndex === -1 ? uri : uri.slice(0, queryIndex);
  const options = queryIndex === -1 ? '' : uri.slice(queryIndex);
  return `${connectionString.replace(/\/+$/, '')}${options}`;
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Database service is not configured.');
  }

  const cache = globalForMongoose.mongooseCache;
  if (cache.connection) return cache.connection;

  if (!cache.promise) {
    cache.promise = mongoose.connect(normalizeMongoUri(uri), { bufferCommands: false })
      .then((connection) => connection)
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
