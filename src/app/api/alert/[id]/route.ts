import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHAINSOS_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get alert details from contract
    const alert = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ChainSOSABI.abi,
      functionName: 'alerts',
      args: [BigInt(params.id)]
    }) as any

    // Get responder details if alert has been responded to
    let responderDetails = null
    if (alert.responder !== '0x0000000000000000000000000000000000000000') {
      responderDetails = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ChainSOSABI.abi,
        functionName: 'getResponderDetails',
        args: [alert.responder]
      }) as any
    }

    // Format the response
    const formattedAlert = {
      id: params.id,
      sender: alert.sender,
      location: [
        Number(alert.longitude) / 1e18,
        Number(alert.latitude) / 1e18
      ],
      timestamp: Number(alert.timestamp),
      isActive: alert.isActive,
      emergencyType: alert.emergencyType,
      responder: alert.responder === '0x0000000000000000000000000000000000000000' ? null : {
        address: alert.responder,
        responseTime: Number(alert.responseTime),
        ...responderDetails && {
          isVerified: responderDetails[0],
          responseCount: Number(responderDetails[1]),
          averageResponseTime: Number(responderDetails[2]),
          reputationScore: Number(responderDetails[3])
        }
      }
    }

    return NextResponse.json(formattedAlert)
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert details' },
      { status: 500 }
    )
  }
} 