'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

const metadata = {
  name: 'ChainSOS',
  description: 'Decentralized Emergency Response System',
  url: 'https://chainsos.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [base]
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true
})

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  defaultChain: base
})

const queryClient = new QueryClient()

export function Web3Modal({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 