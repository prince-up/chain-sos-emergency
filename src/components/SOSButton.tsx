'use client'

import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EmergencyTypeSelector, { EmergencyType } from './EmergencyTypeSelector'
import ChainSOSABI from '@/contracts/abi/ChainSOS.json'

// Replace with your deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHAINSOS_ADDRESS as `0x${string}`

export default function SOSButton({ location }: { location: [number, number] | null }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<EmergencyType | undefined>()
  const { writeContract } = useWriteContract()

  const handleSOS = async () => {
    if (!location) {
      alert('Location access is required to send an SOS alert')
      return
    }

    if (!selectedType) {
      alert('Please select an emergency type')
      return
    }

    setIsLoading(true)
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ChainSOSABI.abi,
        functionName: 'sendSOS',
        args: [
          BigInt(Math.floor(location[0] * 1e18)),
          BigInt(Math.floor(location[1] * 1e18)),
          selectedType
        ],
        value: parseEther('0.01') // Small fee to prevent spam
      })

      setShowDialog(false)
      alert('SOS alert sent successfully! Help is on the way.')
    } catch (error) {
      console.error('Error sending SOS:', error)
      alert('Failed to send SOS alert. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={isLoading || !location}
        className={`
          w-48 h-48 rounded-full 
          ${isLoading ? 'bg-gray-500' : 'bg-primary'}
          text-white font-bold text-2xl
          hover:bg-opacity-90 transition-all duration-200
          flex items-center justify-center
          ${isLoading ? '' : 'animate-pulse-fast'}
          disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl
        `}
      >
        {isLoading ? 'Sending...' : 'SOS'}
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              Select Emergency Type
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <EmergencyTypeSelector
              selected={selectedType}
              onSelect={setSelectedType}
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSOS}
                disabled={!selectedType || isLoading}
                className={`
                  px-6 py-2 rounded-lg
                  ${isLoading ? 'bg-gray-500' : 'bg-primary'}
                  text-white font-semibold
                  hover:bg-opacity-90 transition-all
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                {isLoading ? 'Sending...' : 'Send Alert'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 