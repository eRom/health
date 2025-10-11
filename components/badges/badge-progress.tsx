import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { NextBadge } from '@/lib/types/badge'

interface BadgeProgressProps {
  nextBadges: NextBadge[]
  className?: string
}

export function BadgeProgress({ nextBadges, className }: BadgeProgressProps) {
  if (nextBadges.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="font-semibold text-lg mb-2">Félicitations !</h3>
          <p className="text-muted-foreground">
            Tu as débloqué tous les badges disponibles !
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <h3 className="font-semibold text-lg mb-4">Prochaines récompenses</h3>
      <div className="space-y-4">
        {nextBadges.map((nextBadge) => (
          <Card key={nextBadge.definition.type}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{nextBadge.definition.emoji}</div>
                <div>
                  <CardTitle className="text-base">{nextBadge.definition.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {nextBadge.definition.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{nextBadge.progress.current}/{nextBadge.progress.target}</span>
                </div>
                <Progress 
                  value={nextBadge.progress.percentage} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Plus que {nextBadge.progress.remaining} pour obtenir ce badge
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface SingleBadgeProgressProps {
  nextBadge: NextBadge
  className?: string
}

export function SingleBadgeProgress({ nextBadge, className }: SingleBadgeProgressProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-lg">{nextBadge.definition.emoji}</div>
        <span className="text-sm font-medium">{nextBadge.definition.name}</span>
      </div>
      <Progress value={nextBadge.progress.percentage} className="h-2 mb-1" />
      <div className="text-xs text-muted-foreground text-center">
        {nextBadge.progress.remaining} restants
      </div>
    </div>
  )
}
