// src/lib/mongodb.ts (Fixed Build Error)
import { MongoClient, Db, MongoClientOptions } from 'mongodb';

// Read variables, but DO NOT check them here at the top level
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  // Check cache first
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // --- Checks moved INSIDE the function ---
  // Now they only run when the function is called at runtime
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }
  if (!dbName) {
    throw new Error('MONGODB_DB environment variable is not defined.');
  }
  // --- End of moved checks ---

  const options: MongoClientOptions = {};

  try {
    // Use non-null assertion uri! because we checked it above
    const client = new MongoClient(uri!, options);
    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (e) {
    console.error('Failed to connect to database', e);
    throw new Error('Database connection failed'); // Re-throw or handle appropriately
  }
}

// Optional helper remains the same
export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
