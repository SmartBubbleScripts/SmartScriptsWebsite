// src/components/ProductCard.tsx (Fixed ESLint Errors - Full Version)
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import Image from 'next/image';
import { Product } from '@/types/product';
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';

// Interfaces
interface ProductCardProps {
  product: Product;
  isExpanded: boolean;
  onToggleDetails: () => void;
}
interface InitiatePurchaseResponse {
  orderId: string;
  bnbAddress: `0x${string}`;
  bnbAmount: string;
}
type VerifyStatus =
  | 'pending'
  | 'paid'
  | 'completed'
  | 'failed_invitation'
  | 'failed_payment'
  | 'not_found'
  | 'error';
interface VerifyPurchaseResponse {
  status: VerifyStatus;
  message?: string;
}
type CardStatus =
  | 'idle'
  | 'initiating_order'
  | 'waiting_wallet_approval'
  | 'storing_tx'
  | 'polling'
  | VerifyStatus;

export default function ProductCard({
  product,
  isExpanded,
  onToggleDetails,
}: ProductCardProps) {
  // State Variables
  const [githubUsername, setGithubUsername] = useState<string>('');
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiLoading, setUiLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CardStatus>('idle');

  // Hooks
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    data: wagmiTxHash,
    isPending: isTxSending,
    isSuccess: isTxSuccess,
    error: txSubmitError,
    sendTransaction,
    reset: resetSendTransaction,
  } = useSendTransaction();

  // Constants
  const targetChainId = bsc.id;
  const targetChainName = bsc.name;

  // Utility Functions wrapped in useCallback
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      console.log('Polling stopped.');
    }
  }, []); // No dependencies needed

  const startPollingStatus = useCallback(
    (orderId: string) => {
      if (!orderId || pollIntervalRef.current) return;
      console.log(`Starting poll for ${orderId}`);
      setCurrentStatus('polling');
      setUiError(null);
      setUiLoading(true);
      const poll = async () => {
        try {
          const res = await fetch(`/api/verify-purchase?orderId=${orderId}`);
          const data: VerifyPurchaseResponse = await res.json();
          console.log(`Poll response ${orderId}:`, data);
          if (!res.ok && data.status !== 'not_found') {
            console.error(`Polling Err ${res.status}`);
          }
          const finalStates: VerifyStatus[] = [
            'completed',
            'failed_invitation',
            'failed_payment',
            'not_found',
            'error',
          ];
          // Only update if status changed or is final to prevent loops if component re-renders during poll
          setCurrentStatus((prevStatus) => {
            if (
              prevStatus !== data.status ||
              finalStates.includes(data.status)
            ) {
              return data.status;
            }
            return prevStatus;
          });
          if (finalStates.includes(data.status)) {
            stopPolling();
            setUiLoading(false);
            if (
              data.status === 'failed_invitation' ||
              data.status === 'failed_payment' ||
              data.status === 'error'
            ) {
              setUiError(data.message || `Verification failed`);
            }
            if (data.status === 'not_found') {
              setUiError('Order not found.');
            }
          }
        } catch (error) {
          // Fixed: Catch error handling (Line 299 context)
          console.error('Polling fetch error:', error);
          const message =
            error instanceof Error ? error.message : 'Polling check failed';
          setUiError(message);
          stopPolling();
          setCurrentStatus('error');
          setUiLoading(false);
        }
      };
      stopPolling();
      pollIntervalRef.current = setInterval(poll, 15000);
      poll();
    },
    [stopPolling]
  ); // Added stopPolling dependency

  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]); // Fixed: Added missing dependency

  // Main purchase handler
  const handlePurchase = async () => {
    setUiError(null);
    setCurrentOrderId(null);
    setCurrentTxHash(null);
    setCurrentStatus('idle');
    stopPolling();
    resetSendTransaction();
    if (!githubUsername.trim()) {
      setUiError('Please enter GitHub Username.');
      return;
    }
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    if (chain?.id !== targetChainId) {
      setUiError(`Please switch to ${targetChainName}`);
      if (switchChain) {
        try {
          await switchChain({ chainId: targetChainId });
        } catch {
          setUiError('Switch network failed.');
          return;
        }
      } else {
        setUiError('Switch network failed.');
        return;
      }
    }
    setUiLoading(true);
    setCurrentStatus('initiating_order');
    let orderDetails: InitiatePurchaseResponse | null = null;
    try {
      // Initiate Purchase Try block
      console.log('Calling initiate-purchase...');
      const res = await fetch('/api/initiate-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, githubUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate order');
      orderDetails = data as InitiatePurchaseResponse;
      setCurrentOrderId(orderDetails.orderId);
      console.log('Order initiated:', orderDetails.orderId);
    } catch (error) {
      // Fixed: Catch error handling (Line 148 context)
      console.error('Initiate purchase API error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to initiate order.';
      setUiError(message);
      setCurrentStatus('idle');
      setUiLoading(false);
      return;
    }
    if (orderDetails) {
      try {
        // Send Transaction Try block
        console.log(`Sending tx for order ${orderDetails.orderId}...`);
        const valueInWei = parseEther(orderDetails.bnbAmount.toString());
        setCurrentStatus('waiting_wallet_approval');
        sendTransaction({
          to: orderDetails.bnbAddress,
          value: valueInWei,
          chainId: targetChainId,
        });
      } catch (error) {
        // Fixed: Catch error handling
        const message =
          error instanceof Error
            ? error.message
            : 'Error preparing transaction.';
        console.error('SendTransaction prep error:', error);
        setUiError(message);
        setCurrentStatus('error');
        setUiLoading(false);
      }
    } else {
      setUiError('Order details missing.');
      setCurrentStatus('error');
      setUiLoading(false);
    }
  };

  // Effect Hook to watch Wagmi's useSendTransaction status AND trigger verification flow
  useEffect(() => {
    // Stop loading indicator if no longer sending/storing/polling
    if (!isTxSending && !['storing_tx', 'polling'].includes(currentStatus)) {
      setUiLoading(false);
    }

    // Handle transaction submission errors (e.g., user rejection)
    if (txSubmitError) {
      // Fixed: Use instanceof Error safely for txSubmitError message (Line 233 context)
      const message =
        txSubmitError instanceof Error
          ? txSubmitError.message
          : 'Transaction failed or rejected';
      console.error('Transaction Submit Error:', message, txSubmitError);
      setUiError(`Transaction failed: ${message}`);
      setCurrentStatus('error');
      setCurrentOrderId(null);
      resetSendTransaction();
      stopPolling();
      setUiLoading(false);
    }

    // Handle successful transaction submission -> Store Hash -> Start Polling
    if (
      isTxSuccess &&
      wagmiTxHash &&
      currentOrderId &&
      currentStatus !== 'storing_tx' &&
      currentStatus !== 'polling' &&
      currentStatus !== 'completed'
    ) {
      console.log(
        `Tx submitted: ${wagmiTxHash}. Storing hash for ${currentOrderId}...`
      );
      setCurrentStatus('storing_tx');
      setCurrentTxHash(wagmiTxHash);
      setUiLoading(true);
      fetch('/api/store-txhash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: currentOrderId, txHash: wagmiTxHash }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            console.warn(
              `Failed store txHash for ${currentOrderId}: ${
                data.error || res.statusText
              }`
            );
          } else {
            console.log(`Stored txHash for ${currentOrderId}`);
          }
          startPollingStatus(currentOrderId);
        }) // Always start polling
        .catch((error) => {
          // Fixed: Catch error handling (Line 198 context)
          console.error('Store txHash fetch error:', error);
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to store transaction details.';
          setUiError(message); // Show error
          startPollingStatus(currentOrderId!); // Still start polling
        });
      resetSendTransaction(); // Reset wagmi state after handling
    }
    // Fixed: Added startPollingStatus AND stopPolling to dependency array
  }, [
    isTxSending,
    isTxSuccess,
    txSubmitError,
    wagmiTxHash,
    currentOrderId,
    resetSendTransaction,
    currentStatus,
    startPollingStatus,
    stopPolling,
  ]);

  // --- JSX Structure ---
  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col ${
        isExpanded ? 'shadow-lg' : ''
      }`}
    >
      <div className='relative w-full h-48'>
        {' '}
        <Image
          src={product.imageUrl || '/placeholder-image.jpg'}
          alt={product.name}
          fill
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          style={{ objectFit: 'cover' }}
          className='rounded-t-lg'
          priority
        />{' '}
      </div>
      <div className='p-4 flex flex-col flex-grow'>
        <h2
          className='text-lg font-semibold mb-2 truncate text-gray-900 dark:text-white'
          title={product.name}
        >
          {product.name}
        </h2>
        <p className='text-gray-600 dark:text-gray-300 mb-3 text-sm flex-grow'>
          {product.description}
        </p>
        <div className='mt-auto'>
          <div className='flex justify-between items-center mb-3'>
            {' '}
            <span className='text-xl font-bold text-indigo-600 dark:text-indigo-400'>
              {typeof product.price === 'string' ||
              typeof product.price === 'number'
                ? parseFloat(product.price.toString()).toFixed(4)
                : 'N/A'}{' '}
              BNB
            </span>{' '}
            <span className='text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full font-medium'>
              {product.type}
            </span>{' '}
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className='mb-3 flex flex-wrap gap-1'>
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className='text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {isExpanded && (
            <div className='mt-4 pt-4 border-t border-gray-300 dark:border-gray-700'>
              <h3 className='text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300'>
                {' '}
                Details:{' '}
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap'>
                {product.longDescription || 'No details.'}
              </p>
              {/* --- Purchase Flow UI --- */}
              {currentStatus === 'idle' && (
                <div className='flex flex-col space-y-2'>
                  {' '}
                  <input
                    type='text'
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder='Your GitHub Username (case-sensitive)'
                    className='border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    disabled={uiLoading}
                    required
                  />{' '}
                  <button
                    onClick={handlePurchase}
                    disabled={uiLoading || !githubUsername.trim()}
                    className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium ${
                      uiLoading || !githubUsername.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {' '}
                    {uiLoading ? 'Processing...' : 'Buy Now'}{' '}
                  </button>{' '}
                </div>
              )}
              {currentStatus === 'initiating_order' && (
                <p className='text-gray-500 dark:text-gray-400 text-xs mt-1 text-center'>
                  Initiating order...
                </p>
              )}
              {currentStatus === 'waiting_wallet_approval' && (
                <p className='text-blue-500 dark:text-blue-400 text-xs mt-1 text-center animate-pulse'>
                  Please approve the transaction in your wallet...
                </p>
              )}
              {(currentStatus === 'storing_tx' ||
                currentStatus === 'polling' ||
                currentStatus === 'pending' ||
                currentStatus === 'paid') && (
                <div className='text-center mt-2 p-2 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded'>
                  {' '}
                  <p className='text-blue-600 dark:text-blue-300 text-xs animate-pulse'>
                    {' '}
                    {currentStatus === 'paid'
                      ? 'Payment detected, granting access...'
                      : 'Transaction sent, verifying confirmation... Please wait.'}{' '}
                    <br />{' '}
                    {currentTxHash &&
                      `(Tx: ${currentTxHash.substring(0, 10)}...)`}{' '}
                    {currentOrderId &&
                      !currentTxHash &&
                      `(Order: ${currentOrderId.substring(0, 8)}...)`}{' '}
                  </p>{' '}
                </div>
              )}
              {currentStatus === 'completed' && (
                <div className='mt-2 text-center p-3 bg-green-100 dark:bg-gray-700 border border-green-300 dark:border-gray-600 rounded'>
                  {' '}
                  <p className='text-green-700 dark:text-green-300 font-semibold text-sm mb-1'>
                    {' '}
                    Purchase Verified! Access Granted.{' '}
                  </p>{' '}
                  <p className='text-sm text-gray-700 dark:text-gray-300'>
                    {' '}
                    Check GitHub (
                    <strong className='font-mono'>{githubUsername}</strong>) for
                    the repository invitation.{' '}
                  </p>{' '}
                </div>
              )}
              {(currentStatus === 'failed_invitation' ||
                currentStatus === 'failed_payment' ||
                currentStatus === 'error' ||
                currentStatus === 'not_found') && (
                <div className='text-center mt-2 p-2 bg-red-50 dark:bg-gray-700 border border-red-200 dark:border-gray-600 rounded'>
                  {' '}
                  <p className='text-red-600 dark:text-red-400 text-xs'>
                    {' '}
                    {uiError || 'An error occurred.'}{' '}
                    {currentOrderId &&
                      ` (Order: ${currentOrderId.substring(0, 8)}...)`}{' '}
                    {currentTxHash &&
                      ` (Tx: ${currentTxHash.substring(0, 10)}...)`}{' '}
                    <br />{' '}
                    {currentStatus === 'not_found'
                      ? 'Check Order ID if contacting support.'
                      : 'Contact support if issue persists.'}{' '}
                  </p>{' '}
                </div>
              )}
              {uiError &&
                ![
                  'failed_invitation',
                  'failed_payment',
                  'error',
                  'not_found',
                ].includes(currentStatus) && (
                  <p className='text-red-600 dark:text-red-400 text-xs mt-1 text-center'>
                    {' '}
                    Error: {uiError}{' '}
                  </p>
                )}
            </div>
          )}
          <button
            onClick={onToggleDetails}
            className='w-full mt-3 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-medium'
            disabled={
              uiLoading &&
              ['polling', 'storing_tx', 'waiting_wallet_approval'].includes(
                currentStatus
              )
            }
          >
            {' '}
            {isExpanded ? 'Hide Details' : 'View Details & Purchase'}{' '}
          </button>
        </div>
      </div>
    </div>
  );
}
