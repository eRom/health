import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Clock, TrendingUp, Flame } from 'lucide-react'
import type { DashboardStats } from '@/lib/types/dashboard'

interface StatsCardsProps {
  stats: DashboardStats
  translations: {
    totalExercises: string
    totalDuration: string
    averageScore: string
    streak: string
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function StatsCards({ stats, translations }: StatsCardsProps) {
  const statsData = [
    {
      title: translations.totalExercises,
      value: stats.totalExercises.toLocaleString(),
      icon: BarChart3,
      description: 'exercices',
    },
    {
      title: translations.totalDuration,
      value: formatDuration(stats.totalDuration),
      icon: Clock,
      description: "d'entraînement",
    },
    {
      title: translations.averageScore,
      value: stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A',
      icon: TrendingUp,
      description: 'sur tous les exercices',
    },
    {
      title: translations.streak,
      value: stats.recentStreak.toString(),
      icon: Flame,
      description: stats.recentStreak > 1 ? 'jours consécutifs' : 'jour',
    },
  ]

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Statistiques de progression"
    >
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
