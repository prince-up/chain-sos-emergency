import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Modal } from '../components/providers/Web3Modal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChainSOS - Instant Onchain Emergency Help Network',
  description: 'Decentralized emergency response system built on Base',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Modal>
          {children}
        </Web3Modal>
      </body>
    </html>
  )
} 