// src/providers/Web3Provider.tsx (Mainnet Only)
'use client';

import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains'; // Import only BSC Mainnet
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit';

// Only include BSC Mainnet
const supportedChains = [bsc] as const;

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const appInfo = {
  appName: 'My Bot Store', // Update with your actual app name if needed
};

if (!projectId && typeof window !== 'undefined') {
  console.warn(
    'WalletConnect Project ID is missing! Check NEXT_PUBLIC_WC_PROJECT_ID in .env.local'
  );
}

// Configure default wallets for the supported chains (only mainnet)
const { wallets: defaultWalletGroups } = getDefaultWallets({
  appName: appInfo.appName,
  projectId: projectId,
  // @ts-expect-error Property 'chains' does not exist on type '{ appName: string; projectId: string; }'. It might still work.
  chains: supportedChains, // Pass mainnet chain here
});

// Create connectors
const connectors = connectorsForWallets(
  defaultWalletGroups,
  // Optionally customize wallet groups if needed:
  // [
  //     ...defaultWalletGroups, // Keep default wallets
  //     // Add other specific wallets if desired
  // ],
  {
    projectId: projectId,
    appName: appInfo.appName,
  }
);

// Create Wagmi config targeting only BSC Mainnet
export const wagmiConfig = createConfig({
  connectors,
  chains: supportedChains, // Use mainnet-only chains array
  transports: {
    [bsc.id]: http(), // Configure transport only for mainnet
  },
});

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering on client
  if (!isMounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize='compact'
          theme={darkTheme()} // Or your preferred theme
          appInfo={appInfo}
          // chains prop is not needed here as it's handled by WagmiProvider config
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
