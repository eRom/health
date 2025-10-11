'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type AssociationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'

interface AssociationStatusBadgeProps {
  status: AssociationStatus
  className?: string
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  },
  ACCEPTED: {
    label: 'Accepté',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  DECLINED: {
    label: 'Refusé',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  CANCELLED: {
    label: 'Annulé',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function AssociationStatusBadge({ status, className }: AssociationStatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
