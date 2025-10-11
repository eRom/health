import { getBadges } from '@/app/actions/get-badges'
import { BadgeCard, LockedBadgeCard } from '@/components/badges/badge-card'
import { BadgeProgress } from '@/components/badges/badge-progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllBadgeDefinitions, getBadgesByCategory } from '@/lib/types/badge'
import { Lock, Target, Trophy } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Mes Badges | Health In Cloud',
  description: 'Consultez tous vos badges obtenus et votre progression vers les prochaines récompenses.',
}

async function BadgesContent() {
  const { badges, stats } = await getBadges()
  
  const earnedBadgeTypes = new Set(badges.map(b => b.badgeType))
  const allDefinitions = getAllBadgeDefinitions()
  const lockedBadges = allDefinitions.filter(def => !earnedBadgeTypes.has(def.type))

  // Group badges by category
  const badgesByCategory = {
    earned: badges,
    welcome: getBadgesByCategory('welcome').filter(def => !earnedBadgeTypes.has(def.type)),
    first: getBadgesByCategory('first').filter(def => !earnedBadgeTypes.has(def.type)),
    streak: getBadgesByCategory('streak').filter(def => !earnedBadgeTypes.has(def.type)),
    volume: getBadgesByCategory('volume').filter(def => !earnedBadgeTypes.has(def.type))
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Mes Badges</h1>
        </div>
        <p className="text-muted-foreground">
          Consultez vos récompenses et votre progression
        </p>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Vue d&apos;ensemble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.totalEarned}
              </div>
              <div className="text-sm text-muted-foreground">Badges obtenus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalAvailable}
              </div>
              <div className="text-sm text-muted-foreground">Badges disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(stats.completionPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Complété</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.nextBadges.length}
              </div>
              <div className="text-sm text-muted-foreground">Prochains</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Badges Progress */}
      {stats.nextBadges.length > 0 && (
        <BadgeProgress nextBadges={stats.nextBadges} />
      )}

      {/* Earned Badges */}
      {badges.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Badges obtenus</h2>
            <Badge variant="secondary">{badges.length}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges by Category */}
      {lockedBadges.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold">Badges à débloquer</h2>
            <Badge variant="outline">{lockedBadges.length}</Badge>
          </div>

          {/* Welcome Badges */}
          {badgesByCategory.welcome.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">🎉 Badges de bienvenue</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badgesByCategory.welcome.map((definition) => (
                  <LockedBadgeCard key={definition.type} definition={definition} />
                ))}
              </div>
            </div>
          )}

          {/* First Exercise Badges */}
          {badgesByCategory.first.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">🌱 Premier exercice</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badgesByCategory.first.map((definition) => (
                  <LockedBadgeCard key={definition.type} definition={definition} />
                ))}
              </div>
            </div>
          )}

          {/* Streak Badges */}
          {badgesByCategory.streak.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">🔥 Série consécutive</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badgesByCategory.streak.map((definition) => (
                  <LockedBadgeCard key={definition.type} definition={definition} />
                ))}
              </div>
            </div>
          )}

          {/* Volume Badges */}
          {badgesByCategory.volume.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">📊 Volume d&apos;exercices</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badgesByCategory.volume.map((definition) => (
                  <LockedBadgeCard key={definition.type} definition={definition} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {badges.length === 0 && lockedBadges.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Commencez votre parcours !</h3>
            <p className="text-muted-foreground mb-4">
              Complétez votre premier exercice pour débloquer vos premiers badges.
            </p>
            <Link href="/neuro" className="inline-block">
              <Badge variant="default" className="text-sm px-4 py-2">
                Commencer les exercices
              </Badge>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BadgesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-12 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function BadgesPage() {
  return (
    <Suspense fallback={<BadgesSkeleton />}>
      <BadgesContent />
    </Suspense>
  )
}
