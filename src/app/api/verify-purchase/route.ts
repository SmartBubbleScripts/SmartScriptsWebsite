// src/app/api/verify-purchase/route.ts (Reverted to GET Handler for Polling)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { inviteUserToRepo } from '@/lib/github';
import { ObjectId, Collection } from 'mongodb'; // Removed Db import

// Interfaces needed by this route
interface OrderDocument {
  _id: ObjectId;
  orderId: string;
  productId: ObjectId;
  githubUsername: string;
  status: string /* other fields */;
}
interface ProductDocument {
  _id: ObjectId;
  githubOwner?: string;
  githubRepo?: string /* other fields */;
}

// GET Handler: Checks status based on orderId query parameter, triggers invite if 'paid'
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json(
      { status: 'error', message: 'Order ID required' },
      { status: 400 }
    );
  }

  let orderIdForLogging = orderId.substring(0, 8); // Short ID for logs

  try {
    const { db } = await connectToDatabase();
    const orders: Collection<OrderDocument> = db.collection('orders');
    const products: Collection<ProductDocument> = db.collection('products');

    const order = await orders.findOne({ orderId: orderId });

    if (!order) {
      return NextResponse.json(
        { status: 'not_found', message: 'Order not found' },
        { status: 404 }
      );
    }

    // If the background job marked it as 'paid', attempt the GitHub invite (only once)
    if (order.status === 'paid') {
      console.log(
        `VERIFY API [GET]: Order ${orderIdForLogging} is 'paid'. Attempting invite for ${order.githubUsername}.`
      );
      const product = await products.findOne({
        _id: new ObjectId(order.productId),
      });

      if (!product || !product.githubOwner || !product.githubRepo) {
        console.error(
          `VERIFY API [GET]: Product details missing for invite (Order: ${orderIdForLogging}, Product: ${order.productId})`
        );
        await orders.updateOne(
          { orderId },
          {
            $set: {
              status: 'failed_invitation',
              error: 'Product config missing (owner/repo)',
            },
          }
        );
        return NextResponse.json(
          { status: 'failed_invitation', message: 'Product config error' },
          { status: 500 }
        );
      }

      console.log(
        `VERIFY API [GET]: Inviting ${order.githubUsername} to ${product.githubOwner}/${product.githubRepo}`
      );
      const inviteResult = await inviteUserToRepo(
        order.githubUsername,
        product.githubOwner,
        product.githubRepo
      );

      if (inviteResult.success) {
        await orders.updateOne(
          { orderId },
          { $set: { status: 'completed', grantedAt: new Date() } }
        );
        console.log(
          `VERIFY API [GET]: Invite success for ${orderIdForLogging}. Status: completed.`
        );
        return NextResponse.json({
          status: 'completed',
          message: 'Access granted. Check GitHub invitation.',
        });
      } else {
        await orders.updateOne(
          { orderId },
          { $set: { status: 'failed_invitation', error: inviteResult.error } }
        );
        console.error(
          `VERIFY API [GET]: Invite failed for ${orderIdForLogging}. Error: ${inviteResult.error}`
        );
        return NextResponse.json(
          {
            status: 'failed_invitation',
            message: inviteResult.error || 'GitHub invite failed',
          },
          { status: 500 }
        );
      }
    }

    // If status is not 'paid', just return the current status
    // console.log(`VERIFY API [GET]: Returning current status for Order ${orderIdForLogging}: ${order.status}`); // Reduce logging noise maybe
    return NextResponse.json({ status: order.status });
  } catch (error) {
    console.error(
      `VERIFY API [GET]: Unhandled error for Order ${orderIdForLogging}:`,
      error
    );
    const message =
      error instanceof Error ? error.message : 'Unknown server error.';
    if (message.includes('Database connection failed')) {
      return NextResponse.json(
        { status: 'error', message: 'DB connection error' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Internal Server Error', detail: message },
      { status: 500 }
    );
  }
}

// Disallow POST for this route in this flow
export async function POST(_req: NextRequest) {
  console.log('VERIFY API: POST request received (Not Allowed)');
  return NextResponse.json(
    { message: 'Method Not Allowed. Use GET to check status.' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
