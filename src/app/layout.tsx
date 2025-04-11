import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import '@rainbow-me/rainbowkit/styles.css';
import Analytics from '@/components/Analytics';
import { GA_MEASUREMENT_ID } from '@/lib/gtag';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://bubblepy.com'),
  title: {
    default:
      'Bubble Automations - Secure BSC & SOL Decentralized Automation Scripts',
    template: '%s | Bubble Automations',
  },
  description:
    'Purchase secure, tested Python scripts and bots for automating tasks and trading on the Binance Smart Chain (BSC) and Solana chain. Instant delivery via crypto payment.',
  openGraph: {
    title: 'Bubble Automations - Secure Automation Scripts, Tools and Bots',
    description:
      'Automate your BSC & SOL interactions with reliable Python scripts.',
    url: 'https://bubblepy.com/',
    siteName: 'Bubble Automations',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bubble Automations Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bubble Automations - Secure Automation Scripts, Tools and Bots',
    description:
      'Automate your BSC & SOL interactions with reliable Python scripts.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <Suspense fallback={null}>
        <Analytics gaId={GA_MEASUREMENT_ID} />
      </Suspense>
      <body
        className={`${inter.className} bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 text-gray-900 dark:text-gray-100 flex flex-col min-h-screen`}
      >
        <Web3Provider>
          <div className='flex flex-col flex-grow'>
            <Navbar />
            <div className='flex-grow'>{children}</div>
            <Footer />
          </div>
          <ScrollToTopButton />
        </Web3Provider>
      </body>
    </html>
  );
}
