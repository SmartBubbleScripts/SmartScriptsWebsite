import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { Collection, ObjectId } from 'mongodb'; // Removed Db import

export async function POST(request: NextRequest) {
  try {
    const { productId, githubUsername } = await request.json();
    if (!productId || !ObjectId.isValid(productId) || !githubUsername) {
      return NextResponse.json(
        { error: 'Missing or invalid fields (productId, githubUsername)' },
        { status: 400 }
      );
    }
    const { db } = await connectToDatabase();
    const productsCollection: Collection = db.collection('products');
    const ordersCollection: Collection = db.collection('orders');
    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });
    if (!product || !product.price || typeof product.price !== 'string') {
      return NextResponse.json(
        { error: 'Product not found or invalid price (must be string)' },
        { status: 404 }
      );
    }
    const bnbAmount = product.price;
    const orderId = randomUUID();
    const newOrder = {
      orderId,
      productId: new ObjectId(productId),
      githubUsername,
      bnbAmount,
      status: 'pending',
      createdAt: new Date(),
    };
    await ordersCollection.insertOne(newOrder);
    return NextResponse.json({
      orderId,
      bnbAddress: process.env.NEXT_PUBLIC_RECIPIENT_WALLET_ADDRESS,
      bnbAmount,
    });
  } catch (error) {
    // Changed: Catch block uses 'error' not 'any'
    console.error('Initiate purchase failed:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown server error.';
    if (message.includes('Database connection failed')) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', detail: message },
      { status: 500 }
    ); // Include detail
  }
}
