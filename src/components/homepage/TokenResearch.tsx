'use client';

import React, { useState } from 'react';
import {
  createPublicClient,
  http,
  isAddress,
  formatUnits,
  zeroAddress,
} from 'viem';
import { bsc } from 'viem/chains';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiUser,
  FiPercent,
  FiLink,
} from 'react-icons/fi';
import { bep20Abi } from '@/constants/abis/bep20Abi';

const BSC_MAINNET_RPC_URL = process.env.NEXT_PUBLIC_BSC_MAINNET_RPC_URL;

const publicClient = BSC_MAINNET_RPC_URL
  ? createPublicClient({ chain: bsc, transport: http(BSC_MAINNET_RPC_URL) })
  : null;

const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  ownerAddress: `0x${string}` | null;
  isRenounced: boolean;
  burnPercent: number | null;
}

export default function TokenResearch() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAddress(event.target.value);
    setTokenInfo(null);
    setError(null);
  };

  const handleLookup = async () => {
    setError(null);
    setTokenInfo(null);

    if (!publicClient) {
      setError(
        'RPC client is not configured correctly. Check NEXT_PUBLIC_BSC_MAINNET_RPC_URL environment variable.'
      );
      return;
    }
    if (!tokenAddress || !isAddress(tokenAddress)) {
      setError('Please enter a valid BSC address.');
      return;
    }

    setIsLoading(true);
    try {
      const contractsToCall = [
        {
          address: tokenAddress,
          abi: bep20Abi,
          functionName: 'name',
          args: undefined,
        },
        {
          address: tokenAddress,
          abi: bep20Abi,
          functionName: 'symbol',
          args: undefined,
        },
        {
          address: tokenAddress,
          abi: bep20Abi,
          functionName: 'decimals',
          args: undefined,
        },
        {
          address: tokenAddress,
          abi: bep20Abi,
          functionName: 'totalSupply',
          args: undefined,
        },
        {
          address: tokenAddress,
          abi: bep20Abi,
          functionName: 'owner',
          args: undefined,
        },
        {
          address: tokenAddress,
          abi: bep20Abi,
          functionName: 'balanceOf',
          args: [BURN_ADDRESS],
        },
      ] as const;

      const results = await publicClient.multicall({
        contracts: contractsToCall,
        allowFailure: true,
      });

      const getResult = (index: number): unknown => {
        // Return unknown
        if (results[index].status !== 'success') {
          console.warn(
            `Multicall failed for function: ${contractsToCall[index].functionName}`
          );
          return null;
        }
        return results[index].result;
      };

      const name = getResult(0) as string | null;
      const symbol = getResult(1) as string | null;
      const decimals = getResult(2) as number | null;
      const totalSupplyRaw = getResult(3) as bigint | null;
      const ownerAddress = getResult(4) as `0x${string}` | null;
      const burnBalanceRaw = getResult(5) as bigint | null;

      if (
        name === null ||
        symbol === null ||
        decimals === null ||
        totalSupplyRaw === null
      ) {
        throw new Error('Could not retrieve essential token information...');
      }

      const totalSupplyFormatted = formatUnits(totalSupplyRaw, decimals);
      const isRenounced = ownerAddress === zeroAddress;

      let burnPercent: number | null = null;
      if (burnBalanceRaw !== null && totalSupplyRaw > BigInt(0)) {
        const burnBalance = parseFloat(formatUnits(burnBalanceRaw, decimals));
        const totalSupply = parseFloat(totalSupplyFormatted);
        if (totalSupply > 0) {
          burnPercent = (burnBalance / totalSupply) * 100;
        } else {
          burnPercent = 0;
        }
      }

      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply: totalSupplyFormatted,
        ownerAddress,
        isRenounced,
        burnPercent,
      });
    } catch (err: unknown) {
      // Use unknown
      console.error('Error fetching token info:', err);
      let errorMessage = 'Failed to fetch token info.';
      if (err instanceof Error) {
        if (
          err.message?.includes(
            'Could not retrieve essential token information'
          )
        ) {
          errorMessage = err.message;
        } else if (err.message?.includes('ContractMethodExecutionError')) {
          errorMessage =
            'Could not read token info. Is it a valid BEP-20 contract address?';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setTokenInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const bscScanUrl = `https://bscscan.com/address/${tokenAddress}`;

  return (
    <section className='w-full py-12 md:py-16 lg:py-20 mb-8'>
      <div className='container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-3'>
          {' '}
          BSC Token Research{' '}
        </h2>
        <p className='text-md text-gray-600 dark:text-gray-400 mb-2'>
          {' '}
          Get basic on-chain insights for BSC tokens.{' '}
        </p>
        <p className='text-xs text-gray-500 dark:text-gray-500 mb-6'>
          {' '}
          Disclaimer: Not investment advice. Data fetched directly from the
          blockchain.{' '}
        </p>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto'>
          <input
            type='text'
            value={tokenAddress}
            onChange={handleAddressChange}
            placeholder='Enter BSC token address (0x...)'
            className='flex-grow w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
          />
          <button
            onClick={handleLookup}
            disabled={isLoading || !tokenAddress || !isAddress(tokenAddress)}
            className='w-full sm:w-auto px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {' '}
            {isLoading ? 'Loading...' : 'Lookup'}{' '}
          </button>
        </div>
        {error && (
          <div className='mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm'>
            {' '}
            Error: {error}{' '}
          </div>
        )}
        {isLoading && (
          <div className='mt-6 flex items-center justify-center text-gray-500 dark:text-gray-400'>
            {' '}
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-solid border-indigo-500 border-t-transparent dark:border-indigo-400 dark:border-t-transparent mr-2'></div>{' '}
            Fetching data...{' '}
          </div>
        )}
        {tokenInfo && !isLoading && !error && (
          <div className='mt-8 p-6 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg text-left shadow-sm'>
            <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
              {' '}
              <FiLink className='mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400' />{' '}
              Token Information{' '}
            </h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm'>
              <p>
                {' '}
                <strong className='text-gray-600 dark:text-gray-400'>
                  Name:
                </strong>{' '}
                {tokenInfo.name || 'N/A'}{' '}
              </p>
              <p>
                {' '}
                <strong className='text-gray-600 dark:text-gray-400'>
                  Symbol:
                </strong>{' '}
                {tokenInfo.symbol || 'N/A'}{' '}
              </p>
              <p>
                {' '}
                <strong className='text-gray-600 dark:text-gray-400'>
                  Decimals:
                </strong>{' '}
                {tokenInfo.decimals?.toString() ?? 'N/A'}{' '}
              </p>
              <p>
                {' '}
                <strong className='text-gray-600 dark:text-gray-400'>
                  Total Supply:
                </strong>{' '}
                {tokenInfo.totalSupply
                  ? parseFloat(tokenInfo.totalSupply).toLocaleString('en-US')
                  : 'N/A'}{' '}
              </p>
              <div className='flex items-center'>
                {tokenInfo.ownerAddress !== null ? (
                  tokenInfo.isRenounced ? (
                    <FiCheckCircle className='h-4 w-4 text-green-500 mr-2 flex-shrink-0' />
                  ) : (
                    <FiUser className='h-4 w-4 text-orange-500 mr-2 flex-shrink-0' />
                  )
                ) : (
                  <FiAlertTriangle className='h-4 w-4 text-gray-500 mr-2 flex-shrink-0' />
                )}
                <strong className='text-gray-600 dark:text-gray-400 mr-1'>
                  Ownership:
                </strong>{' '}
                {tokenInfo.ownerAddress === null
                  ? 'Unknown'
                  : tokenInfo.isRenounced
                  ? 'Renounced'
                  : 'Active'}
              </div>
              <p className='flex items-center'>
                {tokenInfo.burnPercent !== null ? (
                  <FiPercent className='h-4 w-4 text-blue-500 mr-2 flex-shrink-0' />
                ) : (
                  <FiAlertTriangle className='h-4 w-4 text-gray-500 mr-2 flex-shrink-0' />
                )}
                <strong className='text-gray-600 dark:text-gray-400 mr-1'>
                  Burned:
                </strong>{' '}
                {tokenInfo.burnPercent !== null
                  ? `${tokenInfo.burnPercent.toFixed(2)}%`
                  : 'Unknown'}
              </p>
              <div className='sm:col-span-2 mt-2'>
                <strong className='text-gray-600 dark:text-gray-400'>
                  Explorer:
                </strong>
                {isAddress(tokenAddress) ? (
                  <a
                    href={bscScanUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='ml-2 text-indigo-600 dark:text-indigo-400 hover:underline break-all'
                  >
                    {' '}
                    View on BscScan{' '}
                  </a>
                ) : (
                  <span className='ml-2 text-gray-500'>N/A</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
