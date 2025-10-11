import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Link } from '@/i18n/routing'
import type { BadgeStats, UserBadgeWithProgress } from '@/lib/types/badge'
import { Award, Target, Trophy } from 'lucide-react'

interface BadgeSummaryProps {
  badges: UserBadgeWithProgress[]
  stats: BadgeStats
  className?: string
}

export function BadgeSummary({ badges, stats, className }: BadgeSummaryProps) {
  const recentBadges = badges.slice(0, 3)
  const nextBadge = stats.nextBadges?.[0]

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Mes Badges
          </CardTitle>
          <Link href="/badges">
            <Button variant="ghost" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.totalEarned}
            </div>
            <div className="text-xs text-muted-foreground">Obtenus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalAvailable}
            </div>
            <div className="text-xs text-muted-foreground">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(stats.completionPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">Complété</div>
          </div>
        </div>

        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span>{stats.totalEarned}/{stats.totalAvailable}</span>
          </div>
          <Progress value={stats.completionPercentage} className="h-2" />
        </div>

        {/* Recent badges */}
        {recentBadges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Derniers badges</span>
            </div>
            <div className="flex gap-2">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-1 bg-yellow-50 rounded-full px-2 py-1"
                >
                  <span className="text-sm">{badge.definition.emoji}</span>
                  <span className="text-xs text-muted-foreground">
                    {badge.definition.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next badge progress */}
        {nextBadge && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Prochain badge</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{nextBadge.definition.emoji}</span>
                <span className="text-sm">{nextBadge.definition.name}</span>
              </div>
              <Progress value={nextBadge.progress.percentage} className="h-1" />
              <div className="text-xs text-muted-foreground text-center">
                Plus que {nextBadge.progress.remaining} pour débloquer
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {badges.length === 0 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-sm text-muted-foreground mb-2">
              Commence tes exercices pour débloquer tes premiers badges !
            </p>
            <Link href="/neuro">
              <Button size="sm">Commencer</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
