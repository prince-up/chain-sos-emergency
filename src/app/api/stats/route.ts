import { NextResponse } from 'next/server'
import { fetchActiveAlerts, fetchActiveResponders, fetchLastHundredAlerts } from '@/lib/utils'

export async function GET() {
  try {
    // Fetch all required data in parallel
    const [activeAlerts, activeResponders, lastHundredAlerts] = await Promise.all([
      fetchActiveAlerts(),
      fetchActiveResponders(),
      fetchLastHundredAlerts(),
    ])

    let totalResponseTime = 0
    let resolvedAlerts = 0
    let successfulResponses = 0

    // Process alerts to calculate statistics
    for (const alert of lastHundredAlerts) {
      if (alert && alert.resolvedAt > 0n) {
        const responseTime = Number(alert.resolvedAt - alert.createdAt)
        totalResponseTime += responseTime
        resolvedAlerts++

        // Consider response successful if resolved within 30 minutes
        if (responseTime <= 30 * 60) {
          successfulResponses++
        }
      }
    }

    // Calculate average response time (in minutes) and success rate
    const averageResponseTime = resolvedAlerts > 0 
      ? (totalResponseTime / resolvedAlerts) / 60 
      : 0
    
    const successRate = resolvedAlerts > 0 
      ? (successfulResponses / resolvedAlerts) * 100 
      : 0

    return NextResponse.json({
      activeAlerts: Number(activeAlerts),
      activeResponders: Number(activeResponders),
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
    })
  } catch (error) {
    console.error('Error fetching network statistics:', error)
    return NextResponse.json({
      activeAlerts: 0,
      activeResponders: 0,
      averageResponseTime: 0,
      successRate: 0,
    })
  }
} 