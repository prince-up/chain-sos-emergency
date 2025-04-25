'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useReadContract } from 'wagmi'
import Header from '@/components/Header'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHAINSOS_ADDRESS as `0x${string}`

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[80vh] w-full bg-gray-100 animate-pulse" />
})

interface MapAlert {
  id: number
  location: [number, number]
  timestamp: number
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapAlerts, setMapAlerts] = useState<MapAlert[]>([])

  // Get active alert IDs
  const { data: activeAlertIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChainSOSABI.abi,
    functionName: 'getActiveAlerts',
    query: {
      staleTime: 5000, // Refresh every 5 seconds
    }
  })

  // Get alert details
  useEffect(() => {
    if (!activeAlertIds || !Array.isArray(activeAlertIds)) return

    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            alertIds: activeAlertIds.map(id => id.toString()),
            contractAddress: CONTRACT_ADDRESS 
          })
        })

        if (!response.ok) throw new Error('Failed to fetch alerts')

        const alerts = await response.json()
        
        // Transform contract alerts to map alerts
        const transformed = alerts
          .filter((alert: any) => alert && alert.isActive)
          .map((alert: any) => ({
            id: Number(alert.id),
            location: [
              Number(alert.longitude) / 1e18,
              Number(alert.latitude) / 1e18
            ],
            timestamp: Number(alert.timestamp)
          }))

        setMapAlerts(transformed)
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    fetchAlerts()
    
    // Set up polling
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [activeAlertIds])

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.longitude, position.coords.latitude])
      })
    }
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Emergency Map</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
              <span className="text-sm">Active Alert</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-accent rounded-full mr-2"></span>
              <span className="text-sm">Your Location</span>
            </div>
          </div>
        </div>

        <div className="card h-[80vh] overflow-hidden">
          <Map 
            userLocation={userLocation}
            alerts={mapAlerts}
          />
        </div>
      </div>
    </main>
  )
} 