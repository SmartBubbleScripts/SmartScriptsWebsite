'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useState } from 'react';

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleButtonClick = () => {
    if (isConnected) {
      setIsDropdownOpen((prev) => !prev);
    } else if (openConnectModal) {
      openConnectModal();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  return (
    <nav
      className='sticky top-0 z-50 w-full
                 bg-white/60 dark:bg-gray-900/60
                 backdrop-blur-lg
                 border-b border-white/10 dark:border-gray-700/50
                 shadow-sm
                 px-4 md:px-8'
    >
      <div className='container mx-auto'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex-shrink-0'>
            <Link href='/' className='flex items-center space-x-2 pt-2'>
              <Image
                src='/logo.png'
                alt='Bubble Automations Logo'
                width={100}
                height={40}
                priority
              />
            </Link>
          </div>

          <div className='hidden md:flex flex-grow justify-center space-x-6 lg:space-x-8 items-center'>
            <Link
              href='/'
              className='text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400'
            >
              Home
            </Link>
            <Link
              href='/products'
              className='text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400'
            >
              Products
            </Link>
            <Link
              href='/terms'
              className='text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400'
            >
              Terms
            </Link>
          </div>

          <div className='flex-shrink-0 relative'>
            <button
              onClick={handleButtonClick}
              className='px-4 py-2 bg-indigo-600 opacity-90 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 text-sm font-medium transition-colors shadow-sm'
              disabled={!openConnectModal && !isConnected}
            >
              {isConnected && address
                ? `✅ ${formatAddress(address)}`
                : 'Connect Wallet'}
            </button>

            {isConnected && isDropdownOpen && (
              <div
                className='absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='user-menu-button'
              >
                <button
                  onClick={handleDisconnect}
                  className='block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  role='menuitem'
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
