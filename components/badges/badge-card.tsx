import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { BadgeDefinition, UserBadgeWithProgress } from '@/lib/types/badge'
import { cn } from '@/lib/utils'

interface BadgeCardProps {
  badge: UserBadgeWithProgress
  className?: string
}

interface LockedBadgeCardProps {
  definition: BadgeDefinition
  className?: string
}

export function BadgeCard({ badge, className }: BadgeCardProps) {
  const { definition, earnedAt } = badge

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105",
        "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200",
        className
      )}
    >
      <CardContent className="p-4 text-center">
        <div className="text-4xl mb-2">{definition.emoji}</div>
        <h3 className="font-semibold text-sm mb-1">{definition.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {definition.description}
        </p>
        <Badge variant="secondary" className="text-xs">
          Obtenu le {earnedAt.toLocaleDateString("fr-FR")}
        </Badge>
      </CardContent>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </Card>
  );
}

export function LockedBadgeCard({ definition, className }: LockedBadgeCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden opacity-60",
      "bg-gray-50 border-gray-200",
      className
    )}>
      <CardContent className="p-4 text-center">
        <div className="text-4xl mb-2 grayscale">{definition.emoji}</div>
        <h3 className="font-semibold text-sm mb-1 text-gray-600">{definition.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{definition.description}</p>
        <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
          Verrouillé
        </Badge>
      </CardContent>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-gray-100/50" />
      <div className="absolute top-2 right-2">
        <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </Card>
  )
}
