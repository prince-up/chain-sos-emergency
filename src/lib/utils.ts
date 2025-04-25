import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CONTRACT_ADDRESS = '0x31a6788c8C1DCe9f3979B05627347BE05B2E0e26'

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export async function fetchAlertData(alertId: number) {
  try {
    return await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ChainSOSABI.abi,
      functionName: 'alerts',
      args: [BigInt(alertId)],
    })
  } catch (error) {
    console.error(`Error fetching alert ${alertId}:`, error)
    return null
  }
}

export async function fetchActiveAlerts() {
  try {
    return await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ChainSOSABI.abi,
      functionName: 'getActiveAlerts',
    })
  } catch (error) {
    console.error('Error fetching active alerts:', error)
    return BigInt(0)
  }
}

export async function fetchActiveResponders() {
  try {
    return await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ChainSOSABI.abi,
      functionName: 'getActiveResponders',
    })
  } catch (error) {
    console.error('Error fetching active responders:', error)
    return BigInt(0)
  }
}

export async function fetchLastHundredAlerts() {
  const alerts = []
  try {
    const totalAlerts = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ChainSOSABI.abi,
      functionName: 'totalAlerts',
    })

    const startId = totalAlerts > 100n ? totalAlerts - 100n : 0n
    const endId = totalAlerts

    const fetchPromises = []
    for (let i = startId; i < endId; i++) {
      fetchPromises.push(fetchAlertData(Number(i)))
    }

    const results = await Promise.all(fetchPromises)
    return results.filter(result => result !== null)
  } catch (error) {
    console.error('Error fetching last hundred alerts:', error)
    return []
  }
} 