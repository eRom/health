'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import {
    Activity,
    Clock,
    MessageSquare,
    Minus,
    TrendingDown,
    TrendingUp
} from 'lucide-react'
import { AssociationStatusBadge } from './association-status-badge'

interface PatientStatsCardProps {
  patient: {
    id: string
    patientId: string
    patientName: string
    patientEmail: string
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'
    createdAt: Date
    acceptedAt?: Date | null
    invitationSentAt?: Date | null
    stats: {
      totalAttempts: number
      averageScore: number
      lastActivity: Date
      unreadMessages: number
      totalMessages: number
    }
  }
  href?: string
  className?: string
}

export function PatientStatsCard({ patient, href, className }: PatientStatsCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Aujourd'hui"
    if (diffInDays === 1) return "Hier"
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
    return `Il y a ${Math.floor(diffInDays / 30)} mois`
  }

  const getTrendIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 60) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        href && "cursor-pointer hover:border-primary/50",
        className
      )}
    >
      {href ? (
        <Link href={href} className="block">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">
                  {patient.patientName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {patient.patientEmail}
                </p>
              </div>
              <AssociationStatusBadge status={patient.status} />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Statistiques principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Exercices</span>
                </div>
                <p className="text-2xl font-bold">
                  {patient.status === 'ACCEPTED' ? patient.stats.totalAttempts : '-'}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {patient.status === 'ACCEPTED' ? getTrendIcon(patient.stats.averageScore) : <Activity className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">Score moyen</span>
                </div>
                <p className={cn("text-2xl font-bold", patient.status === 'ACCEPTED' ? getScoreColor(patient.stats.averageScore) : "text-muted-foreground")}>
                  {patient.status === 'ACCEPTED' ? `${patient.stats.averageScore.toFixed(1)}%` : '-'}
                </p>
              </div>
            </div>

            {/* Messages */}
            {patient.status === 'ACCEPTED' && patient.stats.totalMessages > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {patient.stats.totalMessages}
                  </span>
                  {patient.stats.unreadMessages > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {patient.stats.unreadMessages} non lus
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Dernière activité */}
            {patient.status === 'ACCEPTED' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dernière activité</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatTimeAgo(patient.stats.lastActivity)}
                </p>
              </div>
            )}

            {/* Informations sur l'association */}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Invité le {formatDate(patient.createdAt)}
                </span>
                {patient.acceptedAt && (
                  <span>
                    Accepté le {formatDate(patient.acceptedAt)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Link>
      ) : (
        <>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">
                  {patient.patientName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {patient.patientEmail}
                </p>
              </div>
              <AssociationStatusBadge status={patient.status} />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Statistiques principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Exercices</span>
                </div>
                <p className="text-2xl font-bold">
                  {patient.status === 'ACCEPTED' ? patient.stats.totalAttempts : '-'}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {patient.status === 'ACCEPTED' ? getTrendIcon(patient.stats.averageScore) : <Activity className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">Score moyen</span>
                </div>
                <p className={cn("text-2xl font-bold", patient.status === 'ACCEPTED' ? getScoreColor(patient.stats.averageScore) : "text-muted-foreground")}>
                  {patient.status === 'ACCEPTED' ? `${patient.stats.averageScore.toFixed(1)}%` : '-'}
                </p>
              </div>
            </div>

            {/* Messages */}
            {patient.status === 'ACCEPTED' && patient.stats.totalMessages > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {patient.stats.totalMessages}
                  </span>
                  {patient.stats.unreadMessages > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {patient.stats.unreadMessages} non lus
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Dernière activité */}
            {patient.status === 'ACCEPTED' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dernière activité</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatTimeAgo(patient.stats.lastActivity)}
                </p>
              </div>
            )}

            {/* Informations sur l'association */}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Invité le {formatDate(patient.createdAt)}
                </span>
                {patient.acceptedAt && (
                  <span>
                    Accepté le {formatDate(patient.acceptedAt)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
