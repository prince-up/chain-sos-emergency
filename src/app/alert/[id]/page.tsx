'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Clock, MapPin, AlertTriangle, User } from 'lucide-react'
import ResponderProfile from '@/components/ResponderProfile'

// Dynamically import the Map component
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
})

interface Alert {
  id: string
  sender: string
  location: [number, number]
  timestamp: number
  isActive: boolean
  emergencyType: 'medical' | 'fire' | 'police' | 'accident'
  responder: {
    address: string
    responseTime: number
    isVerified: boolean
    responseCount: number
    averageResponseTime: number
    reputationScore: number
  } | null
}

const emergencyTypeInfo = {
  medical: {
    label: 'Medical Emergency',
    color: 'text-red-500 bg-red-50',
    icon: AlertTriangle
  },
  fire: {
    label: 'Fire Emergency',
    color: 'text-orange-500 bg-orange-50',
    icon: AlertTriangle
  },
  police: {
    label: 'Police Emergency',
    color: 'text-blue-500 bg-blue-50',
    icon: Shield
  },
  accident: {
    label: 'Accident',
    color: 'text-yellow-500 bg-yellow-50',
    icon: AlertTriangle
  }
}

export default function AlertPage() {
  const params = useParams()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const response = await fetch(`/api/alert/${params.id}`)
        const data = await response.json()
        setAlert(data)
      } catch (error) {
        console.error('Error fetching alert:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlert()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-[400px] bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!alert) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">Alert Not Found</h2>
            <p className="text-gray-600">The emergency alert you're looking for doesn't exist.</p>
          </div>
        </div>
      </main>
    )
  }

  const emergencyType = emergencyTypeInfo[alert.emergencyType]
  const EmergencyIcon = emergencyType.icon

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold">Emergency Alert #{alert.id}</h1>
            <Badge className={emergencyType.color}>
              <EmergencyIcon className="w-4 h-4 mr-1" />
              {emergencyType.label}
            </Badge>
            <Badge variant={alert.isActive ? "destructive" : "secondary"}>
              {alert.isActive ? 'Active' : 'Resolved'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sender</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-mono">
                  {alert.sender.slice(0, 6)}...{alert.sender.slice(-4)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div>{new Date(alert.timestamp * 1000).toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Location</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm">
                  {alert.location[1].toFixed(6)}, {alert.location[0].toFixed(6)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow mb-8">
            <div className="h-[400px] relative">
              <Map
                userLocation={null}
                alerts={[{
                  id: Number(alert.id),
                  location: alert.location,
                  timestamp: alert.timestamp
                }]}
              />
            </div>
          </div>

          {alert.responder && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Responding Unit</h2>
              <div className="bg-white rounded-lg p-6">
                <ResponderProfile address={alert.responder.address} />
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-2">Response Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="text-lg font-semibold">
                        {Math.round(alert.responder.responseTime / 60)} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={alert.isActive ? "default" : "success"}>
                        {alert.isActive ? 'En Route' : 'Completed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 