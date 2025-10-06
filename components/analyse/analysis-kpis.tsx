import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, TrendingUp, Target, ArrowUp, ArrowDown } from 'lucide-react'
import type { AnalysisData } from '@/app/actions/get-analysis-data'

interface AnalysisKpisProps {
  data: AnalysisData['kpis']
  translations: {
    totalAttempts: string
    totalDuration: string
    averageScore: string
    consistency: string
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

function TrendIndicator({ value }: { value: number }) {
  if (Math.abs(value) < 0.1) {
    return null
  }

  const isPositive = value > 0
  const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  const Icon = isPositive ? ArrowUp : ArrowDown

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{Math.abs(value).toFixed(1)}%</span>
    </div>
  )
}

export function AnalysisKpis({ data, translations }: AnalysisKpisProps) {
  const kpisData = [
    {
      title: translations.totalAttempts,
      value: data.totalAttempts.toLocaleString(),
      icon: Activity,
      trend: data.trends.attempts,
    },
    {
      title: translations.totalDuration,
      value: formatDuration(data.totalDuration),
      icon: Clock,
      trend: data.trends.duration,
    },
    {
      title: translations.averageScore,
      value: data.averageScore > 0 ? `${data.averageScore.toFixed(1)}%` : 'N/A',
      icon: TrendingUp,
      trend: data.trends.score,
    },
    {
      title: translations.consistency,
      value: `${data.consistency.toFixed(0)}%`,
      icon: Target,
      trend: data.trends.consistency,
    },
  ]

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Indicateurs clés de performance"
    >
      {kpisData.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <TrendIndicator value={kpi.trend} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
