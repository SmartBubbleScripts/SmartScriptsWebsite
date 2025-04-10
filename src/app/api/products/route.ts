// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'bsc_project';
const collectionName = process.env.MONGODB_PRODUCTS_COLLECTION || 'products';

if (!uri) {
  console.error('PRODUCTS API (Load Time): MONGODB_URI missing!');
}

let mongoClient: MongoClient | null = null;
if (uri) {
  mongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  console.log('PRODUCTS API (Load Time): MongoClient instance created.');
} else {
  console.error(
    'PRODUCTS API (Load Time): Cannot create MongoClient, URI missing.'
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  console.log('PRODUCTS API: GET request received.');

  if (!mongoClient) {
    console.error(
      'PRODUCTS API: MongoClient is not available (URI was missing).'
    );
    return NextResponse.json(
      { error: 'Server configuration error: Database connection failed.' },
      { status: 500 }
    );
  }

  let isConnected = false;

  try {
    console.log('PRODUCTS API: Attempting to connect to MongoDB...');
    await mongoClient.connect();
    isConnected = true;
    console.log('PRODUCTS API: Connected to MongoDB successfully.');

    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);
    console.log(
      `PRODUCTS API: Accessing collection '${collectionName}' in db '${dbName}'.`
    );

    console.log('PRODUCTS API: Finding published products...');
    const products = await collection
      .find({ status: 'published' }, { projection: { downloadUrl: 0 } })
      .toArray();
    console.log(`PRODUCTS API: Found ${products.length} products.`);

    const serializableProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }));
    console.log('PRODUCTS API: Products processed for serialization.');

    return NextResponse.json(serializableProducts);
  } catch (error: unknown) {
    console.error('PRODUCTS API: Error during request processing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products due to server error.' },
      { status: 500 }
    );
  } finally {
    if (mongoClient && isConnected) {
      try {
        await mongoClient.close();
        console.log('PRODUCTS API: MongoDB connection closed.');
      } catch (closeError) {
        console.error(
          'PRODUCTS API: Error closing MongoDB connection:',
          closeError
        );
      }
    } else {
      console.log(
        'PRODUCTS API: MongoDB connection not established or already closed, skipping close in finally.'
      );
    }
  }
}
