'use client';

import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit';

const supportedChains = [bsc] as const;

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const appInfo = {
  appName: 'My Bot Store',
};

if (!projectId && typeof window !== 'undefined') {
  console.warn(
    'WalletConnect Project ID is missing! Check NEXT_PUBLIC_WC_PROJECT_ID in .env.local'
  );
}

const { wallets: defaultWalletGroups } = getDefaultWallets({
  appName: appInfo.appName,
  projectId: projectId,
  // @ts-expect-error Property 'chains' does not exist on type '{ appName: string; projectId: string; }'. It might still work.
  chains: supportedChains,
});

// Create connectors
const connectors = connectorsForWallets(
  defaultWalletGroups,

  {
    projectId: projectId,
    appName: appInfo.appName,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: supportedChains,
  transports: {
    [bsc.id]: http(),
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

  if (!isMounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize='compact'
          theme={darkTheme()}
          appInfo={appInfo}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
