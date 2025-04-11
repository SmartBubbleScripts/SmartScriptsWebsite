import React from 'react';
import { FiShield } from 'react-icons/fi';

export default function SecurityFeature() {
  return (
    <div className='bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center h-full'>
      <div className='bg-indigo-100 rounded-full p-3 mb-4 inline-flex'>
        <FiShield className='w-8 h-8 text-indigo-600' />
      </div>
      <h3 className='text-xl font-semibold text-gray-800 mb-2'>
        Your Security First
      </h3>
      <p className='text-gray-600 text-sm leading-relaxed'>
        Our Python tools interact securely with your wallet. Your sensitive keys
        remain completely private, stored only within your own local `.env`
        file. Scripts are rigorously tested to be error-free and reliable.
      </p>
    </div>
  );
}
