'use client'

import { useState } from 'react'
import { 
  HeartIcon, 
  FireIcon, 
  ShieldExclamationIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

export type EmergencyType = 'medical' | 'fire' | 'police' | 'accident'

interface EmergencyOption {
  id: EmergencyType
  name: string
  icon: any
  description: string
  color: string
}

const emergencyTypes: EmergencyOption[] = [
  {
    id: 'medical',
    name: 'Medical',
    icon: HeartIcon,
    description: 'Medical emergency requiring immediate attention',
    color: 'text-red-500'
  },
  {
    id: 'fire',
    name: 'Fire',
    icon: FireIcon,
    description: 'Fire emergency or hazardous situation',
    color: 'text-orange-500'
  },
  {
    id: 'police',
    name: 'Police',
    icon: ShieldExclamationIcon,
    description: 'Security emergency requiring police assistance',
    color: 'text-blue-500'
  },
  {
    id: 'accident',
    name: 'Accident',
    icon: ExclamationTriangleIcon,
    description: 'Vehicle accident or collision',
    color: 'text-yellow-500'
  }
]

interface Props {
  onSelect: (type: EmergencyType) => void
  selected?: EmergencyType
}

export default function EmergencyTypeSelector({ onSelect, selected }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {emergencyTypes.map((type) => {
        const Icon = type.icon
        const isSelected = selected === type.id
        
        return (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${isSelected 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-200 hover:border-primary/50'}
            `}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Icon className={`w-8 h-8 ${type.color}`} />
              <h3 className="font-semibold">{type.name}</h3>
              <p className="text-sm text-gray-600 hidden md:block">
                {type.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
} 