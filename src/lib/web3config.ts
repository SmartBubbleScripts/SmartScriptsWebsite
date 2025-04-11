import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { bsc } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not defined');
}

const metadata = {
  name: 'My BSC Bot Store',
  description: 'Purchase amazing bots with BSC',
  url: 'http://localhost:3000',
  icons: ['/favicon.ico'],
};

const chains = [bsc] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'light',
});
