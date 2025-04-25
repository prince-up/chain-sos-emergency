'use client'

import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Clock, Award, Star } from 'lucide-react'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHAINSOS_ADDRESS as `0x${string}`

interface ResponderStats {
  isVerified: boolean
  responseCount: number
  averageResponseTime: number
  reputationScore: number
}

interface Props {
  address: `0x${string}`
}

export default function ResponderProfile({ address }: Props) {
  const { data: responderData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChainSOSABI.abi,
    functionName: 'getResponderDetails',
    args: [address],
  })

  const stats: ResponderStats = {
    isVerified: responderData?.[0] ?? false,
    responseCount: Number(responderData?.[1] ?? 0),
    averageResponseTime: Number(responderData?.[2] ?? 0),
    reputationScore: Number(responderData?.[3] ?? 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{address.slice(0, 6)}...{address.slice(-4)}</h2>
          <div className="flex items-center space-x-2 mt-1">
            {stats.isVerified ? (
              <Badge variant="success" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Verified Responder</span>
              </Badge>
            ) : (
              <Badge variant="secondary">Unverified</Badge>
            )}
            <Badge variant="outline" className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{stats.reputationScore} Rep</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Count</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseCount}</div>
            <p className="text-xs text-muted-foreground">
              Total emergencies responded to
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageResponseTime / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to respond
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reputationScore}</div>
            <p className="text-xs text-muted-foreground">
              Based on response history
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 