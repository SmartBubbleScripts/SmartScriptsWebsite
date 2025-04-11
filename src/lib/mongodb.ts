import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }
  if (!dbName) {
    throw new Error('MONGODB_DB environment variable is not defined.');
  }

  const options: MongoClientOptions = {};

  try {
    const client = new MongoClient(uri!, options);
    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (e) {
    console.error('Failed to connect to database', e);
    throw new Error('Database connection failed');
  }
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
