'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAccount } from 'wagmi'
import SOSButton from '@/components/SOSButton'
import Header from '@/components/Header'
import { ArrowTrendingUpIcon, ShieldCheckIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[60vh] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
})

interface Stats {
  activeAlerts: number
  activeResponders: number
  averageResponseTime: number
  successRate: number
}

export default function Home() {
  const { isConnected } = useAccount()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [stats, setStats] = useState<Stats>({
    activeAlerts: 0,
    activeResponders: 0,
    averageResponseTime: 0,
    successRate: 0
  })

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude])
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }

    // Fetch network statistics
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const StatCard = ({ title, value, icon: Icon, description }: { 
    title: string
    value: string | number
    icon: any
    description: string 
  }) => (
    <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-gray-600 text-sm mt-2">{description}</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col justify-center items-center space-y-6">
            <div className="text-center md:text-left w-full">
              <h1 className="text-5xl font-bold mb-4">
                Emergency Help Network
              </h1>
              <p className="text-xl text-gray-600 max-w-md mb-8">
                Send instant SOS alerts and connect with verified responders nearby. 
                Powered by blockchain technology for trust and accountability.
              </p>
              
              {isConnected ? (
                <SOSButton location={userLocation} />
              ) : (
                <div className="card text-center p-8 bg-white">
                  <p className="text-lg mb-4">Connect your wallet to send SOS alerts</p>
                  <w3m-button />
                </div>
              )}
            </div>
          </div>

          <div className="h-[60vh] card overflow-hidden bg-white">
            <Map userLocation={userLocation} alerts={[]} />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Network Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Alerts"
              value={stats.activeAlerts}
              icon={ArrowTrendingUpIcon}
              description="Emergency alerts processed"
            />
            <StatCard
              title="Active Responders"
              value={stats.activeResponders}
              icon={UserGroupIcon}
              description="Verified emergency responders"
            />
            <StatCard
              title="Avg. Response Time"
              value={`${stats.averageResponseTime.toFixed(1)} min`}
              icon={ClockIcon}
              description="Average emergency response time"
            />
            <StatCard
              title="Success Rate"
              value={`${stats.successRate.toFixed(1)}%`}
              icon={ShieldCheckIcon}
              description="Successfully resolved alerts"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-white p-6">
            <div className="text-primary mb-4">🚨</div>
            <h3 className="text-xl font-bold mb-2">One-Tap SOS</h3>
            <p className="text-gray-600">
              Send emergency alerts instantly with your location. Quick and simple when every second counts.
            </p>
          </div>
          <div className="card bg-white p-6">
            <div className="text-primary mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Verified Responders</h3>
            <p className="text-gray-600">
              All responders are verified through blockchain staking, ensuring trust and accountability.
            </p>
          </div>
          <div className="card bg-white p-6">
            <div className="text-primary mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600">
              Monitor emergency situations and responses in real-time with our interactive map.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 