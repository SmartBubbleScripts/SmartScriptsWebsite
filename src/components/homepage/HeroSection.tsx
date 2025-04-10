// src/components/homepage/HeroSection.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className='w-full py-16 md:py-24 lg:py-32'>
      {/* Container for content width and horizontal padding */}
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Left Column: Text Content & CTA */}
          <div className='text-center md:text-left'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6'>
              Powerful Automation
              <span className='block text-indigo-600 dark:text-indigo-400 xl:inline'>
                {' '}
                for Binance Smart Chain
              </span>
            </h1>
            <p className='mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg lg:text-xl max-w-xl mx-auto md:mx-0'>
              Your one-stop shop for high-quality, secure Python Scripts
              designed to interact directly with your wallet and automate your
              BSC tasks.
            </p>
            <div className='mt-8 sm:mt-10 flex justify-center md:justify-start'>
              <Link
                href='/products'
                className='inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Explore Tools
              </Link>
            </div>
          </div>

          {/* Right Column: Image/Illustration Placeholder */}
          <div className='mt-12 md:mt-0'>
            {/* Replace this div with your actual illustration/image */}
            <div className='w-full h-64 md:h-80 lg:h-96  rounded-lg shadow-xl flex items-center justify-center'>
              <Image
                src='/hero.png'
                alt='hero image'
                width={500}
                height={40}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
