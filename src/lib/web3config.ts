// src/lib/web3config.ts
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { bsc } from 'wagmi/chains'; // Import BSC Mainnet

// 1. Get projectId from environment variables
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not defined');
}

// 2. Create wagmiConfig
const metadata = {
  name: 'My BSC Bot Store', // Your dApp name
  description: 'Purchase amazing bots with BSC', // Your dApp description
  url: 'http://localhost:3000', // Your dApp URL (can be localhost for dev)
  icons: ['/favicon.ico'], // Optional: Array of icon URLs
};

const chains = [bsc] as const; // Specify BSC as the only chain

// Use defaultWagmiConfig for simplicity with Web3Modal
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true, // Important for Next.js SSR/SSG
  // Optional: Add custom transports if needed, otherwise defaults are used
  // transports: {
  //   [bsc.id]: http(),
  // },
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'light', // Or 'dark' or 'system'
  // Optional: Add theme variables, accent colors, etc.
  // themeVariables: {
  //   '--w3m-accent': '#00BB7F',
  // }
});
