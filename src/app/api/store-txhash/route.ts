import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Collection } from 'mongodb'; // Removed Db import

export async function POST(request: NextRequest) {
  try {
    const { orderId, txHash } = await request.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid orderId' },
        { status: 400 }
      );
    }
    if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Missing or invalid txHash' },
        { status: 400 }
      );
    }
    const { db } = await connectToDatabase();
    const ordersCollection: Collection = db.collection('orders');
    const result = await ordersCollection.updateOne(
      { orderId: orderId, status: 'pending' },
      { $set: { txHash: txHash } }
    );
    if (result.matchedCount === 0) {
      console.warn(
        `Store TxHash API: Order not found or not pending for orderId: ${orderId}`
      );
    } else {
      console.log(
        `Store TxHash API: Stored txHash ${txHash} for orderId ${orderId}`
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    // Changed: Catch block uses 'error' not 'any'
    console.error('Store txHash failed:', error);
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
    );
  }
}
