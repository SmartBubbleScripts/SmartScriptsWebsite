import type { Metadata } from 'next';
import ProductList from '@/components/ProductList';

export const metadata: Metadata = {
  title: 'BSC Automation Scripts | Bubblepy',
  description:
    'Browse and purchase secure Python scripts for BSC tasks like sniping, auto-trading, and predictions. Instant crypto payment & delivery.',

  alternates: {
    canonical: 'https://bubblepy.com/products',
  },

  openGraph: {
    title: 'BSC Automation Scripts | Bubblepy',
    description:
      'Browse secure Python scripts for BSC tasks. Instant crypto payment & delivery.',
    url: 'https://bubblepy.com/products',
    siteName: 'Bubblepy',

    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary',
    title: 'BSC Automation Scripts | Bubblepy',
    description:
      'Browse secure Python scripts for BSC tasks. Instant crypto payment & delivery.',
  },
};

export default function ProductsPage() {
  return (
    <main className='flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-16 bg-gray-50 dark:bg-transparent pt-20 sm:pt-24 md:pt-28 pb-10'>
      <h2 className='text-2xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-white opacity-80'>
        Our Scripts
      </h2>
      <div className='w-full max-w-6xl'>
        <p className='text-center mb-6 sm:mb-8 text-gray-600 dark:text-gray-300 opacity-80'>
          Browse our selection of high-quality scripts and tools.
        </p>

        <ProductList />
      </div>
    </main>
  );
}
