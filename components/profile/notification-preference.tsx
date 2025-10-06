'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updatePreferences } from '@/app/actions/update-preferences'
import { toast } from 'sonner'

export function NotificationPreference({
  currentEmailNotifications,
}: {
  currentEmailNotifications: boolean
}) {
  const [emailNotifications, setEmailNotifications] = useState(currentEmailNotifications)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle(checked: boolean) {
    setIsLoading(true)

    const result = await updatePreferences({ emailNotifications: checked })

    if (result.success) {
      setEmailNotifications(checked)
      toast.success('Préférences mises à jour avec succès')
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour')
    }

    setIsLoading(false)
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-muted-foreground">Notifications</p>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="email-notifications"
          checked={emailNotifications}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <Label
          htmlFor="email-notifications"
          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Recevoir des notifications par email
        </Label>
      </div>
      <p className="ml-6 mt-1 text-xs text-muted-foreground">
        Nouveaux exercices, rappels et actualités de la plateforme
      </p>
    </div>
  )
}
