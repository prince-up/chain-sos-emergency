import Link from 'next/link'
import { useAccount } from 'wagmi'

export default function Header() {
  const { isConnected } = useAccount()

  return (
    <header className="bg-surface shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">🚨 ChainSOS</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/map" className="text-gray-600 hover:text-gray-900">
              Explore Map
            </Link>
            <Link href="/responders" className="text-gray-600 hover:text-gray-900">
              Responders
            </Link>
            {isConnected ? (
              <w3m-button />
            ) : (
              <button className="btn-primary">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 