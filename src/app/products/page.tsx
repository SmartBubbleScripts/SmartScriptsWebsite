import type { Metadata } from 'next';
import ProductList from '@/components/ProductList';

export const metadata: Metadata = {
  title: 'BSC Automation Scripts',
  description:
    'Browse and purchase secure Python scripts for BSC tasks like sniping, auto-trading, and predictions. Instant crypto payment & delivery.',
};

export default function ProductsPage() {
  return (
    <main className='flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-16 bg-gray-50 dark:bg-transparent'>
      <h2 className='text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-white'>
        Our Scripts
      </h2>
      <div className='w-full max-w-6xl'>
        <p className='text-center mb-6 sm:mb-8 text-gray-600 dark:text-gray-300'>
          Browse our selection of high-quality scripts and tools.
        </p>

        <ProductList />
      </div>
    </main>
  );
}
