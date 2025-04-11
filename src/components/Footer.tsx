import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='w-full bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-t border-white/10 dark:border-gray-700/30 mt-auto py-6'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-y-3'>
          <div className='flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1'>
            <span>
              © {currentYear} Bubble Automations. All Rights Reserved.
            </span>
            <Link
              href='/terms'
              className='hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'
            >
              Terms and Conditions
            </Link>
          </div>
          <div className='flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-1'>
            <span>Designed by Davinci</span>
            <span className='hidden sm:inline'>|</span>
            <span>
              Powered by{' '}
              <a
                href='https://bscscan.com/apis'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline'
              >
                BscScan APIs
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
