'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      setProducts([]);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(
            `API responded with ${res.status}: ${res.statusText}. Body: ${errorBody}`
          );
          throw new Error(`Failed to fetch products (status: ${res.status})`);
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error('Fetched data is not an array:', data);
          throw new Error('Invalid data format received from API');
        }
        setProducts(data as Product[]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An unknown error occurred fetching products.'
        );
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleToggleDetails = (productId: string) => {
    setExpandedProductId((currentId) => {
      const nextId = currentId === productId ? null : productId;

      return nextId;
    });
  };

  if (isLoading) {
    return (
      <div className='text-center text-gray-500 dark:text-gray-400 p-10'>
        <p className='font-semibold'>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-600 border border-red-300 bg-red-50 dark:bg-red-900/20 p-10 rounded-lg'>
        <p className='font-semibold'>Could not load products.</p>
        <p className='text-sm mt-1'>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className='text-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-600 p-10 rounded-lg'>
        <p className='font-semibold'>No products available at the moment.</p>
        <p className='text-sm mt-1'>Please check back later!</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start'>
      {products.map((product) => {
        const isCardExpanded = expandedProductId === product._id;

        return (
          <ProductCard
            key={product._id}
            product={product}
            isExpanded={isCardExpanded}
            onToggleDetails={() => handleToggleDetails(product._id)}
          />
        );
      })}
    </div>
  );
}
