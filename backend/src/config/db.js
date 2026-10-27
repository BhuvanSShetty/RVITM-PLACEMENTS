import { MongoClient } from 'mongodb';

let cachedClient = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined.');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  cachedClient = client;

  // Background ensure index on calendar_events id for high-speed sorted retrieval
  try {
    const dbName = process.env.DB_NAME || 'vtu_database';
    client.db(dbName).collection('calendar_events').createIndex({ id: 1 }).catch(() => {});
  } catch {}

  return client;
}
