'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHAINSOS_ADDRESS as `0x${string}`

interface Alert {
  id: number
  sender: string
  timestamp: number
  location: [number, number]
}

export default function NotificationSystem() {
  const { address } = useAccount()
  const [notifications, setNotifications] = useState<Alert[]>([])
  const [permission, setPermission] = useState<NotificationPermission>('default')

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => setPermission(perm))
    }
  }, [])

  // Watch for new alerts
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ChainSOSABI.abi,
    eventName: 'AlertCreated',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const alert = {
          id: Number(log.args.alertId),
          sender: log.args.sender,
          timestamp: Date.now(),
          location: [
            Number(log.args.longitude) / 1e18,
            Number(log.args.latitude) / 1e18
          ]
        }

        // Add to notifications
        setNotifications(prev => [alert, ...prev])

        // Show toast notification
        toast('New Emergency Alert', {
          description: `Alert #${alert.id} from ${alert.sender.slice(0, 6)}...${alert.sender.slice(-4)}`,
          action: {
            label: 'View',
            onClick: () => window.open(`/map?alert=${alert.id}`, '_blank')
          }
        })

        // Show system notification if permitted
        if (permission === 'granted') {
          new Notification('ChainSOS - Emergency Alert', {
            body: `New emergency alert from ${alert.sender.slice(0, 6)}...${alert.sender.slice(-4)}`,
            icon: '/logo.png'
          })
        }
      })
    }
  })

  // Watch for resolved alerts
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ChainSOSABI.abi,
    eventName: 'AlertResolved',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const alertId = Number(log.args.alertId)
        const responder = log.args.responder
        
        // Remove from notifications
        setNotifications(prev => prev.filter(n => n.id !== alertId))

        // Show resolution notification
        if (address === responder) {
          toast.success('Alert Resolved', {
            description: `You successfully resolved Alert #${alertId}`
          })
        }
      })
    }
  })

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Bell className="h-6 w-6 text-primary" />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </div>
    </div>
  )
} 