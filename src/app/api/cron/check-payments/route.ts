import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { parseEther } from 'viem';
import { Collection, ObjectId } from 'mongodb'; // Removed Db import

// Interfaces remain the same
interface OrderDocument {
  _id: ObjectId;
  orderId: string;
  productId: ObjectId;
  githubUsername: string;
  bnbAmount: string;
  status: string;
  createdAt: Date;
  txHash?: string;
  paidAt?: Date;
  error?: string;
}
interface BscScanTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError: string;
  confirmations: string;
}
interface BscScanApiResponse {
  status: string;
  message: string;
  result: BscScanTx[];
}

// Constants remain the same
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY;
const RECIPIENT_ADDRESS =
  process.env.NEXT_PUBLIC_RECIPIENT_WALLET_ADDRESS?.toLowerCase();
const MIN_CONFIRMATIONS = 15;
const CRON_SECRET = process.env.CRON_SECRET;
const MAX_ORDERS_PER_RUN = 20;
const CHECK_TIME_WINDOW_SECONDS = 3 * 24 * 60 * 60;

async function checkPendingOrders() {
  if (!BSCSCAN_API_KEY || !RECIPIENT_ADDRESS) {
    console.error(
      'CRON JOB Error: Missing BSCSCAN_API_KEY or RECIPIENT_ADDRESS.'
    );
    return {
      processed: 0,
      updated: 0,
      errors: 1,
      message: 'Missing environment variables',
    };
  }
  let updatedCount = 0;
  let processedCount = 0;
  let errorCount = 0;
  const errorMessages: string[] = [];
  try {
    const { db } = await connectToDatabase();
    const ordersCollection: Collection<OrderDocument> = db.collection('orders');
    const pendingOrders = await ordersCollection
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .limit(MAX_ORDERS_PER_RUN)
      .toArray();
    processedCount = pendingOrders.length;
    if (processedCount === 0) {
      console.log('CRON JOB Info: No pending orders found.');
      return {
        processed: 0,
        updated: 0,
        errors: 0,
        message: 'No pending orders',
      };
    }
    console.log(
      `CRON JOB Info: Found ${processedCount} pending orders to check.`
    );
    for (const order of pendingOrders) {
      const orderTimestamp = Math.floor(order.createdAt.getTime() / 1000);
      const startTimestamp = orderTimestamp - 60 * 10;
      const endTimestamp = orderTimestamp + CHECK_TIME_WINDOW_SECONDS;
      let expectedAmountWei: bigint;
      try {
        expectedAmountWei = parseEther(order.bnbAmount.toString());
      } catch (e) {
        // Changed: Use 'e' in log
        const errMsg = `Order ${order.orderId} - Invalid bnbAmount: ${order.bnbAmount}.`;
        console.error(`CRON JOB Error: ${errMsg}`, e); // Log the actual error 'e'
        await ordersCollection.updateOne(
          { _id: order._id },
          { $set: { status: 'failed_payment', error: errMsg } }
        );
        errorCount++;
        errorMessages.push(errMsg);
        continue;
      }
      const apiUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${RECIPIENT_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${BSCSCAN_API_KEY}`;
      try {
        console.log(
          `CRON JOB Info: Checking BscScan order ${order.orderId}, amount ${order.bnbAmount} (${expectedAmountWei} Wei)`
        );
        const response = await fetch(apiUrl);
        if (!response.ok)
          throw new Error(`BscScan API fail status ${response.status}`);
        const data: BscScanApiResponse = await response.json();
        if (data.status !== '1' || !Array.isArray(data.result)) {
          if (data.message?.includes('No transactions found')) {
            console.log(`CRON JOB Info: Order ${order.orderId} - No tx found.`);
            continue;
          } else if (data.message?.includes('Max rate limit reached')) {
            console.warn(`CRON JOB Warn: BscScan rate limit.`);
            errorMessages.push('BscScan rate limit');
            errorCount++;
            break;
          } else {
            throw new Error(
              `BscScan API Error: ${data.message || 'Invalid format'}`
            );
          }
        }
        let paymentFoundAndUpdated = false;
        for (const tx of data.result) {
          const txTimestamp = parseInt(tx.timeStamp, 10);
          if (txTimestamp < startTimestamp) break;
          if (txTimestamp > endTimestamp) continue;
          const isMatch =
            tx.to?.toLowerCase() === RECIPIENT_ADDRESS &&
            tx.value === expectedAmountWei.toString() &&
            tx.isError === '0' &&
            parseInt(tx.confirmations || '0', 10) >= MIN_CONFIRMATIONS;
          if (isMatch) {
            console.log(
              `CRON JOB Info: Found match TX for order ${order.orderId}: ${tx.hash}`
            );
            const updateResult = await ordersCollection.updateOne(
              { _id: order._id, status: 'pending' },
              {
                $set: {
                  status: 'paid',
                  txHash: tx.hash,
                  paidAt: new Date(txTimestamp * 1000),
                },
              }
            );
            if (updateResult.modifiedCount > 0) {
              updatedCount++;
              console.log(`CRON JOB Info: Order ${order.orderId} -> 'paid'.`);
            } else {
              console.log(
                `CRON JOB Info: Order ${order.orderId} not updated (status!=pending?).`
              );
            }
            paymentFoundAndUpdated = true;
            break;
          }
        }
        if (!paymentFoundAndUpdated) {
          console.log(
            `CRON JOB Info: Order ${order.orderId} - No match found yet.`
          );
        }
      } catch (fetchError) {
        // Changed: Catch block uses 'error' not 'any'
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : 'Unknown BscScan processing error';
        const errMsg = `Error processing BscScan for order ${order.orderId}: ${message}`;
        console.error(`CRON JOB Error: ${errMsg}`, fetchError); // Log original error
        errorCount++;
        errorMessages.push(errMsg);
      }
    }
    const summaryMessage = `Run finished. Processed: ${processedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`;
    console.log(`CRON JOB Info: ${summaryMessage}`);
    return {
      processed: processedCount,
      updated: updatedCount,
      errors: errorCount,
      message: summaryMessage,
      errorDetails: errorMessages,
    };
  } catch (error) {
    // Changed: Catch block uses 'error' not 'any'
    console.error('CRON JOB Fatal Error:', error);
    errorCount++;
    const message =
      error instanceof Error ? error.message : 'Unhandled exception';
    if (message.includes('Database connection failed')) {
      return {
        processed: processedCount,
        updated: updatedCount,
        errors: errorCount,
        message: 'Database connection error',
      };
    }
    return {
      processed: processedCount,
      updated: updatedCount,
      errors: errorCount,
      message: message,
    };
  }
}

export async function GET(request: NextRequest) {
  const authToken = (request.headers.get('authorization') || '')
    .split('Bearer ')
    .at(1);
  if (CRON_SECRET && authToken !== CRON_SECRET) {
    console.warn('CRON JOB Warning: Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('CRON JOB Info: Starting payment check run (Authorized)');
  const result = await checkPendingOrders();
  console.log('CRON JOB Info: Payment check run finished.');
  if (result.errors > 0 && result.processed === 0) {
    return NextResponse.json({ success: false, ...result }, { status: 500 });
  } else {
    return NextResponse.json(
      { success: result.errors === 0, ...result },
      { status: 200 }
    );
  }
}
