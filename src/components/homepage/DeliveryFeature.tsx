// src/components/homepage/DeliveryFeature.tsx
import React from 'react';
import { FiZap } from 'react-icons/fi';

export default function DeliveryFeature() {
  return (
    <div className='bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center h-full'>
      {/* Optional Icon Placeholder */}
      <div className='bg-indigo-100 rounded-full p-3 mb-4 inline-flex'>
        {/* Replace SVG with imported React Icon component */}
        <FiZap className='w-8 h-8 text-indigo-600' />
      </div>
      <h3 className='text-xl font-semibold text-gray-800 mb-2'>
        Instant Access & Control
      </h3>
      <p className='text-gray-600 text-sm leading-relaxed'>
        Get immediate access! Upon successful payment verification on the
        Binance Smart Chain, a URL to your Python script and full instructions
        are instantly provided. You can easily configure settings like trade
        amounts directly via the instructions.
      </p>
    </div>
  );
}
