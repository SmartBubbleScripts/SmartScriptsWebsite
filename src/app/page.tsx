import type { Metadata } from 'next';
import SecurityFeature from '@/components/homepage/SecurityFeature';
import DeliveryFeature from '@/components/homepage/DeliveryFeature';
import CustomOrderFeature from '@/components/homepage/CustomOrderFeature';
import HeroSection from '@/components/homepage/HeroSection';
import TokenResearch from '@/components/homepage/TokenResearch';

export const metadata: Metadata = {
  title: 'Homepage',
  description:
    'Get secure Python scripts for BSC automation. Features instant delivery, wallet safety focus, and custom script options. Pay with crypto.',
};

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center'>
      <HeroSection />

      <div className='w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 mb-16 lg:mb-20'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start'>
          <SecurityFeature />
          <DeliveryFeature />
          <CustomOrderFeature />
        </div>
      </div>

      <TokenResearch />
    </main>
  );
}
