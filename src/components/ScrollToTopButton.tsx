'use client';

import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type='button'
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg 
                      bg-indigo-600 hover:bg-indigo-700 
                      text-white dark:bg-indigo-500 dark:hover:bg-indigo-600
                      transition-opacity duration-300 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      ${
                        isVisible
                          ? 'opacity-100'
                          : 'opacity-0 pointer-events-none'
                      }`}
      aria-label='Scroll to top'
    >
      <FiArrowUp className='h-6 w-6' />
    </button>
  );
}
