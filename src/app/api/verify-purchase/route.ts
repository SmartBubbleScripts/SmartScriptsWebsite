import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { inviteUserToRepo } from '@/lib/github';
import { Collection, ObjectId } from 'mongodb';
import {
  createPublicClient,
  http,
  parseEther,
  Address,
  PublicClient,
  TransactionReceipt,
} from 'viem';
import { bsc } from 'viem/chains';

interface ProductDocument {
  _id: ObjectId;
  githubOwner?: string;
  githubRepo?: string;
  price: string /* other fields */;
}

const BSC_RPC_URL = process.env.BSC_MAINNET_RPC_URL;
const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_RECIPIENT_WALLET_ADDRESS as
  | Address
  | undefined;
let viemClient: PublicClient | null = null;

function getViemClient(): PublicClient {
  if (!viemClient) {
    if (!BSC_RPC_URL) throw new Error('BSC_MAINNET_RPC_URL is not defined');
    viemClient = createPublicClient({
      chain: bsc,
      transport: http(BSC_RPC_URL),
    });
    console.log('VERIFY API (POST): Viem client initialized.');
  }
  return viemClient;
}

export async function POST(request: NextRequest) {
  if (!RECIPIENT_ADDRESS) {
    return NextResponse.json(
      { status: 'error', message: 'Recipient address config error.' },
      { status: 500 }
    );
  }
  let orderIdForLogging = 'N/A';
  try {
    const body = await request.json();
    const { txHash, productId, githubUsername, buyerAddress } = body;
    orderIdForLogging = `${productId}-${
      githubUsername?.substring(0, 5) ?? 'nouser'
    }`;

    if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid tx hash.' },
        { status: 400 }
      );
    }
    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid product ID.' },
        { status: 400 }
      );
    }
    if (!githubUsername || typeof githubUsername !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'Invalid GitHub username.' },
        { status: 400 }
      );
    }
    if (
      !buyerAddress ||
      typeof buyerAddress !== 'string' ||
      !buyerAddress.startsWith('0x')
    ) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid buyer address.' },
        { status: 400 }
      );
    }

    const productObjectId = new ObjectId(productId);
    const buyerAddressChecksum = buyerAddress as Address;
    const recipientAddressChecksum = RECIPIENT_ADDRESS;

    console.log(
      `VERIFY API (POST) [${orderIdForLogging}]: Verifying: Tx: ${txHash.substring(
        0,
        10
      )}...`
    );
    const client = getViemClient();
    let receipt: TransactionReceipt | null = null;
    const MAX_RECEIPT_ATTEMPTS = 5;
    const RECEIPT_RETRY_DELAY_MS = 6000;
    console.log(
      `VERIFY API (POST) [${orderIdForLogging}]: Fetching receipt...`
    );
    for (let attempt = 1; attempt <= MAX_RECEIPT_ATTEMPTS; attempt++) {
      try {
        receipt = await client.getTransactionReceipt({
          hash: txHash as `0x${string}`,
        });
        if (receipt) {
          console.log(
            `VERIFY API (POST) [${orderIdForLogging}]: Receipt found (Attempt ${attempt}).`
          );
          break;
        }
      } catch (rpcError) {
        console.warn(
          `VERIFY API (POST) [${orderIdForLogging}]: Receipt attempt ${attempt} error: ${
            (rpcError as Error).message
          }`
        );
      }
      if (attempt < MAX_RECEIPT_ATTEMPTS) {
        await new Promise((res) => setTimeout(res, RECEIPT_RETRY_DELAY_MS));
      }
    }
    if (!receipt) {
      return NextResponse.json(
        { status: 'failed_payment', message: 'Tx receipt not found yet.' },
        { status: 404 }
      );
    }
    if (receipt.status !== 'success') {
      return NextResponse.json(
        { status: 'failed_payment', message: `Tx status: ${receipt.status}.` },
        { status: 400 }
      );
    }
    console.log(`VERIFY API (POST) [${orderIdForLogging}]: Tx status OK.`);

    const MIN_CONFIRMATIONS_DIRECT = 5;
    const block = await client.getBlock({ blockHash: receipt.blockHash });
    const latestBlock = await client.getBlockNumber();
    const confirmations = latestBlock - block.number + 1n;
    console.log(
      `VERIFY API (POST) [${orderIdForLogging}]: Confirmations: ${confirmations}`
    );
    if (confirmations < MIN_CONFIRMATIONS_DIRECT) {
      return NextResponse.json(
        {
          status: 'pending',
          message: `Waiting for confirmations (${confirmations}/${MIN_CONFIRMATIONS_DIRECT}).`,
        },
        { status: 202 }
      );
    }

    const transaction = await client.getTransaction({
      hash: txHash as `0x${string}`,
    });
    if (!transaction) {
      return NextResponse.json(
        { status: 'error', message: 'Could not retrieve tx details.' },
        { status: 500 }
      );
    }

    const { db } = await connectToDatabase();
    const products: Collection<ProductDocument> = db.collection('products');
    const product = await products.findOne({ _id: productObjectId });
    if (!product) {
      return NextResponse.json(
        { status: 'error', message: 'Product not found.' },
        { status: 404 }
      );
    }
    if (!product.price || typeof product.price !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'Product price config error.' },
        { status: 500 }
      );
    }
    if (!product.githubOwner || !product.githubRepo) {
      return NextResponse.json(
        { status: 'error', message: 'Product GitHub config error.' },
        { status: 500 }
      );
    }

    if (
      !transaction.to ||
      transaction.to.toLowerCase() !== recipientAddressChecksum.toLowerCase()
    ) {
      return NextResponse.json(
        { status: 'failed_payment', message: 'Incorrect recipient.' },
        { status: 400 }
      );
    }
    if (
      !transaction.from ||
      transaction.from.toLowerCase() !== buyerAddressChecksum.toLowerCase()
    ) {
      return NextResponse.json(
        { status: 'failed_payment', message: 'Sender mismatch.' },
        { status: 400 }
      );
    }

    let expectedAmountWei: bigint;
    try {
      expectedAmountWei = parseEther(product.price.toString());
    } catch (e) {
      console.error(
        `VERIFY API (POST) [${orderIdForLogging}]: Invalid product price format: ${product.price}`,
        e
      );
      return NextResponse.json(
        { status: 'error', message: 'Invalid product price format.' },
        { status: 500 }
      );
    }
    if (transaction.value < expectedAmountWei) {
      return NextResponse.json(
        {
          status: 'failed_payment',
          message: `Amount too low. Expected ${product.price} BNB.`,
        },
        { status: 400 }
      );
    }
    console.log(`VERIFY API (POST) [${orderIdForLogging}]: All checks passed.`);

    console.log(
      `VERIFY API (POST) [${orderIdForLogging}]: Inviting ${githubUsername} to ${product.githubOwner}/${product.githubRepo}`
    );
    const inviteResult = await inviteUserToRepo(
      githubUsername,
      product.githubOwner,
      product.githubRepo
    );

    if (inviteResult.success) {
      console.log(`VERIFY API (POST) [${orderIdForLogging}]: Invite success.`);
      return NextResponse.json({
        status: 'completed',
        message: 'Access granted. Check GitHub invitation.',
      });
    } else {
      console.error(
        `VERIFY API (POST) [${orderIdForLogging}]: Invite failed: ${inviteResult.error}`
      );
      return NextResponse.json(
        {
          status: 'failed_invitation',
          message: inviteResult.error || 'GitHub invite failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      `VERIFY API (POST) [${orderIdForLogging}]: Unhandled error:`,
      error
    );
    const message =
      error instanceof Error ? error.message : 'Unknown server error.';
    if (message.includes('Database connection failed')) {
      return NextResponse.json(
        { status: 'error', message: 'DB error' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Internal Server Error', detail: message },
      { status: 500 }
    );
  }
}

// Added eslint-disable comment for the unused parameter in GET
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  // This GET handler is not used in the current direct-check flow,
  // but kept to explicitly disallow GET requests.
  return NextResponse.json(
    { message: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
