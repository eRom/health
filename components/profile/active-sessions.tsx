'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { revokeSession } from '@/app/actions/revoke-session'
import { UAParser } from 'ua-parser-js'

type Session = {
  id: string
  createdAt: Date
  updatedAt: Date
  userId: string
  expiresAt: Date
  token: string
  ipAddress: string | null
  userAgent: string | null
}

function maskIpAddress(ip: string | null): string {
  if (!ip) return 'IP inconnue'
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.x.x`
  }
  // IPv6 or other format
  return ip.substring(0, 10) + '...'
}

function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return { browser: 'Navigateur inconnu', os: 'OS inconnu', device: 'Appareil inconnu' }
  }

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const browser = result.browser.name || 'Navigateur inconnu'
  const browserVersion = result.browser.version ? ` ${result.browser.version.split('.')[0]}` : ''
  const os = result.os.name || 'OS inconnu'
  const osVersion = result.os.version ? ` ${result.os.version}` : ''
  const device = result.device.type
    ? result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)
    : 'Ordinateur'

  return {
    browser: browser + browserVersion,
    os: os + osVersion,
    device,
  }
}

export function ActiveSessions({
  sessions,
  currentSessionId,
}: {
  sessions: Session[]
  currentSessionId: string
}) {
  const [localSessions, setLocalSessions] = useState(sessions)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId)
    const result = await revokeSession(sessionId)

    if (result.success) {
      setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId))
    }
    setRevokingId(null)
  }

  return (
    <div className="space-y-4">
      {localSessions.map((session) => {
        const isCurrent = session.id === currentSessionId
        const { browser, os, device } = parseUserAgent(session.userAgent)

        return (
          <div
            key={session.id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              isCurrent ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {device} - {browser}
                </p>
                {isCurrent && (
                  <span className="text-xs font-medium text-primary">
                    (Session actuelle)
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                <p>{os}</p>
                <p>IP: {maskIpAddress(session.ipAddress)}</p>
                <p>
                  Dernière activité:{' '}
                  {new Date(session.updatedAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            {!isCurrent && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={revokingId === session.id}
                  >
                    {revokingId === session.id ? 'Révocation...' : 'Révoquer'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Révoquer cette session ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action déconnectera cet appareil. Vous devrez vous reconnecter
                      pour y accéder à nouveau.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRevoke(session.id)}>
                      Révoquer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )
      })}

      {localSessions.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune session active</p>
      )}
    </div>
  )
}
