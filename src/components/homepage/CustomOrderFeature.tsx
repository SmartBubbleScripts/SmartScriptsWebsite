// src/components/homepage/CustomOrderFeature.tsx
import React from 'react';
import { FiSettings } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
const TELEGRAM_CONTACT_LINK = 'https://t.me/your_telegram_username'; // Placeholder
// --- ---

export default function CustomOrderFeature() {
  return (
    <div className='bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center h-full'>
      {/* Optional Icon Placeholder */}
      <div className='bg-indigo-100 rounded-full p-3 mb-4 inline-flex'>
        {/* Replace SVG with imported React Icon component */}
        <FiSettings className='w-8 h-8 text-indigo-600' />
      </div>
      <h3 className='text-xl font-semibold text-gray-800 mb-2'>
        Need a Custom Solution?
      </h3>
      <p className='text-gray-600 text-sm leading-relaxed mb-4'>
        Have specific automation needs for BSC? We can develop private,
        tailor-made Python tools just for you. Reach out to discuss your
        requirements.
      </p>
      <a
        href={TELEGRAM_CONTACT_LINK}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-auto inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
      >
        {/* Add Telegram Icon before text */}
        <FaTelegramPlane className='h-4 w-4 mr-2' />
        Contact Us on Telegram
      </a>
    </div>
  );
}
