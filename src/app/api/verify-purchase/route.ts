import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { inviteUserToRepo } from '@/lib/github';
import { ObjectId, Collection } from 'mongodb';

// Interfaces
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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json(
      { status: 'error', message: 'Order ID required' },
      { status: 400 }
    );
  }

  // Fixed: Changed 'let' to 'const' as it's not reassigned
  const orderIdForLogging = orderId.substring(0, 8);

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

// Fixed: Added eslint disable comment ABOVE the POST function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  console.log('VERIFY API: POST request received (Not Allowed for this flow)');
  return NextResponse.json(
    { message: 'Method Not Allowed. Use GET to check status.' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
