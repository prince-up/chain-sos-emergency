import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

export async function POST(request: Request) {
  try {
    const { alertIds, contractAddress } = await request.json()

    const alerts = await Promise.all(
      alertIds.map(async (id: string) => {
        try {
          return await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: ChainSOSABI.abi,
            functionName: 'alerts',
            args: [BigInt(id)],
          })
        } catch (error) {
          console.error(`Error fetching alert ${id}:`, error)
          return null
        }
      })
    )

    // Filter out any null results from failed requests
    const validAlerts = alerts.filter(alert => alert !== null)

    return NextResponse.json(validAlerts)
  } catch (error) {
    console.error('Error processing alerts request:', error)
    return NextResponse.json([])
  }
} 