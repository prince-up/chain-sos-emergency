'use client'

import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import Header from '@/components/Header'
import ResponderProfile from '@/components/ResponderProfile'
import { Card } from '@/components/ui/card'
import { Shield, Search } from 'lucide-react'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHAINSOS_ADDRESS as `0x${string}`

interface Responder {
  address: `0x${string}`
  isVerified: boolean
  responseCount: number
}

export default function RespondersPage() {
  const [responders, setResponders] = useState<Responder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponder, setSelectedResponder] = useState<`0x${string}` | null>(null)

  // Get active responders from contract
  const { data: activeResponders } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChainSOSABI.abi,
    functionName: 'getActiveResponders'
  })

  // Fetch responder details
  useEffect(() => {
    const fetchResponders = async () => {
      if (!activeResponders) return

      const responderDetails = await Promise.all(
        Array.from({ length: Number(activeResponders) }, async (_, i) => {
          try {
            const data = await fetch(`/api/responder/${i}`)
            const responder = await data.json()
            return responder
          } catch (error) {
            console.error('Error fetching responder:', error)
            return null
          }
        })
      )

      setResponders(responderDetails.filter(Boolean))
    }

    fetchResponders()
  }, [activeResponders])

  // Filter responders based on search
  const filteredResponders = responders.filter(responder => 
    responder.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Emergency Responders</h1>
            <p className="text-gray-600">
              Verified responders ready to help in emergencies
            </p>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search responders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {selectedResponder ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedResponder(null)}
                className="text-primary hover:underline flex items-center space-x-2"
              >
                <span>← Back to list</span>
              </button>
              <ResponderProfile address={selectedResponder} />
            </div>
          ) : (
            <>
              {filteredResponders.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">No responders found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredResponders.map((responder) => (
                  <Card
                    key={responder.address}
                    className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedResponder(responder.address)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {responder.address.slice(0, 6)}...{responder.address.slice(-4)}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {responder.isVerified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                            <span className="text-sm text-gray-600">
                              {responder.responseCount} responses
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-primary hover:underline">
                        View Profile →
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
} 