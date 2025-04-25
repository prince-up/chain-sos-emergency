'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Replace with your Mapbox access token
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
if (!mapboxToken) {
  console.error('Mapbox token is required')
}
mapboxgl.accessToken = mapboxToken || ''

interface Alert {
  id: number
  location: [number, number]
  timestamp: number
}

interface MapProps {
  userLocation: [number, number] | null
  alerts?: Alert[]
}

export default function Map({ userLocation, alerts = [] }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [mapInitialized, setMapInitialized] = useState(false)
  const [zoom] = useState(13)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLocation || [-74.5, 40], // Default to NYC
        zoom: zoom,
        attributionControl: false
      })

      map.current.addControl(new mapboxgl.NavigationControl())
      map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left')

      map.current.on('load', () => {
        setMapInitialized(true)
      })

      // Cleanup
      return () => {
        map.current?.remove()
        map.current = null
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [mapboxToken])

  // Update map when user location changes
  useEffect(() => {
    if (!map.current || !userLocation || !mapInitialized) return

    try {
      // Add or update user location marker
      const userMarker = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat(userLocation)
        .addTo(map.current)

      map.current.flyTo({
        center: userLocation,
        essential: true,
        duration: 2000
      })

      return () => {
        userMarker.remove()
      }
    } catch (error) {
      console.error('Error updating user location:', error)
    }
  }, [userLocation, mapInitialized])

  // Update alerts on the map
  useEffect(() => {
    if (!map.current || !mapInitialized) return

    try {
      // Remove old markers
      Object.values(markers.current).forEach(marker => marker.remove())
      markers.current = {}

      // Add new markers for alerts
      alerts.forEach(alert => {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-primary">Emergency Alert #${alert.id}</h3>
            <p class="text-sm text-gray-600">
              ${new Date(alert.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        `)

        const marker = new mapboxgl.Marker({ color: '#FF4B4B' })
          .setLngLat(alert.location)
          .setPopup(popup)
          .addTo(map.current!)

        markers.current[alert.id] = marker
      })

      // Fit bounds to include all markers if there are any
      if (alerts.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        alerts.forEach(alert => bounds.extend(alert.location))
        if (userLocation) bounds.extend(userLocation)
        map.current.fitBounds(bounds, { padding: 50 })
      }
    } catch (error) {
      console.error('Error updating alerts:', error)
    }
  }, [alerts, userLocation, mapInitialized])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {!mapboxToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-500">Mapbox token is required</p>
        </div>
      )}
    </div>
  )
}