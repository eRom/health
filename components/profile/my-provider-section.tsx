'use client'

import { acceptProviderInvitation } from '@/app/actions/patient/accept-provider-invitation'
import { declineProviderInvitation } from '@/app/actions/patient/decline-provider-invitation'
import { getMyProvider } from '@/app/actions/patient/get-my-provider'
import { AssociationStatusBadge } from '@/components/healthcare/association-status-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Mail,
    MessageSquare,
    Users,
    XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ProviderInfo {
  id: string
  provider: {
    id: string
    name: string
    email: string
    createdAt: Date
  }
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'
  createdAt: Date
  acceptedAt?: Date | null
  invitationSentAt?: Date | null
  stats: {
    unreadMessages: number
    totalMessages: number
  }
}

export function MyProviderSection() {
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const loadProviderInfo = async () => {
    try {
      const info = await getMyProvider()
      setProviderInfo(info)
    } catch (error) {
      console.error('Error loading provider info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProviderInfo()
  }, [])

  const handleAcceptInvitation = async () => {
    if (!providerInfo) return
    
    setIsProcessing(true)
    try {
      // Récupérer le token d'invitation depuis l'URL ou les paramètres
      const urlParams = new URLSearchParams(window.location.search)
      const invitationToken = urlParams.get('invitation_token')
      
      if (!invitationToken) {
        throw new Error('Token d&apos;invitation manquant')
      }
      
      await acceptProviderInvitation({ invitationToken })
      toast.success('Invitation acceptée avec succès')
      await loadProviderInfo()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de l&apos;acceptation'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeclineInvitation = async () => {
    if (!providerInfo) return
    
    setIsProcessing(true)
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const invitationToken = urlParams.get('invitation_token')
      
      if (!invitationToken) {
        throw new Error('Token d&apos;invitation manquant')
      }
      
      await declineProviderInvitation({ invitationToken })
      toast.success('Invitation refusée')
      await loadProviderInfo()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors du refus'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!providerInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mon soignant
          </CardTitle>
          <CardDescription>
            Votre soignant vous accompagne dans votre rééducation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun soignant associé</h3>
            <p className="text-muted-foreground">
              Aucun professionnel de santé ne vous suit actuellement
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Mon soignant
        </CardTitle>
        <CardDescription>
          Votre soignant vous accompagne dans votre rééducation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations du soignant */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {providerInfo.provider.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold">{providerInfo.provider.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Professionnel de santé
                </p>
              </div>
            </div>
            <AssociationStatusBadge status={providerInfo.status} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{providerInfo.provider.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Membre depuis {formatDate(providerInfo.provider.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {providerInfo.stats.totalMessages > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {providerInfo.stats.totalMessages} message{providerInfo.stats.totalMessages > 1 ? 's' : ''} échangé{providerInfo.stats.totalMessages > 1 ? 's' : ''}
            </span>
            {providerInfo.stats.unreadMessages > 0 && (
              <Badge variant="destructive" className="text-xs">
                {providerInfo.stats.unreadMessages} non lu{providerInfo.stats.unreadMessages > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {/* Actions selon le statut */}
        {providerInfo.status === 'PENDING' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>
                  <strong>{providerInfo.provider.name}</strong> souhaite vous accompagner dans votre rééducation.
                </p>
                <p className="text-sm">
                  Vous pouvez accepter ou refuser cette invitation. Si vous acceptez, votre soignant pourra suivre votre progression et échanger des messages avec vous.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleAcceptInvitation}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accepter
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleDeclineInvitation}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {providerInfo.status === 'ACCEPTED' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Association acceptée le {providerInfo.acceptedAt && formatDate(providerInfo.acceptedAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre soignant peut maintenant suivre votre progression et vous accompagner dans votre rééducation.
            </p>
          </div>
        )}

        {providerInfo.status === 'DECLINED' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Vous avez refusé l&apos;invitation de {providerInfo.provider.name}.
            </AlertDescription>
          </Alert>
        )}

        {providerInfo.status === 'CANCELLED' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              L&apos;association avec {providerInfo.provider.name} a été annulée.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
