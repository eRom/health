'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getAnalysisData } from '@/app/actions/get-analysis-data'
import type { AnalysisData } from '@/app/actions/get-analysis-data'
import { TimeRangeFilter, type TimeRange, type ExerciseType } from '@/components/analyse/time-range-filter'
import { AnalysisKpis } from '@/components/analyse/analysis-kpis'
import { ScoreEvolutionChart } from '@/components/analyse/score-evolution-chart'
import { ExerciseTypeDistributionChart } from '@/components/analyse/exercise-type-distribution-chart'
import { DifficultyDistributionChart } from '@/components/analyse/difficulty-distribution-chart'
import { EmptyState } from '@/components/ui/empty-state'
import { BarChart3 } from 'lucide-react'

export default function AnalysePage() {
  const t = useTranslations('analyse')
  const locale = useLocale() as 'fr' | 'en'

  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [exerciseType, setExerciseType] = useState<ExerciseType>('all')
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    async function loadData() {
      // Premier chargement : loading complet
      // Changement de filtre : juste isRefreshing (garde l'affichage)
      if (isFirstLoad.current) {
        setLoading(true)
        isFirstLoad.current = false
      } else {
        setIsRefreshing(true)
      }

      try {
        const result = await getAnalysisData({
          timeRange,
          exerciseType,
          category: 'all',
          locale,
        })
        setData(result)
      } catch (error) {
        console.error('Error loading analysis data:', error)
        // Log full error details
        if (error instanceof Error) {
          console.error('Error name:', error.name)
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
        }
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    loadData()
  }, [timeRange, exerciseType, locale])

  const hasData = data && data.kpis.totalAttempts > 0

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <TimeRangeFilter
          timeRange={timeRange}
          exerciseType={exerciseType}
          onTimeRangeChange={setTimeRange}
          onExerciseTypeChange={setExerciseType}
        />
      </div>

      {/* Loading state - premier chargement uniquement */}
      {loading && !data && (
        <div className="text-center text-muted-foreground">{t('loading')}</div>
      )}

      {/* Empty state */}
      {!loading && !hasData && (
        <EmptyState
          icon={BarChart3}
          title={t('noData')}
          description={t('noDataDescription')}
        />
      )}

      {/* Data visualization - reste visible pendant le rafraîchissement */}
      {hasData && data && (
        <div className="space-y-8" style={{ opacity: isRefreshing ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {/* KPIs */}
          <AnalysisKpis
            data={data.kpis}
            translations={{
              totalAttempts: t('kpis.totalAttempts'),
              totalDuration: t('kpis.totalDuration'),
              averageScore: t('kpis.averageScore'),
              consistency: t('kpis.consistency'),
            }}
          />

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Evolution */}
            <div className="lg:col-span-2">
              <ScoreEvolutionChart
                data={data.scoreEvolution}
                title={t('charts.scoreEvolution')}
              />
            </div>

            {/* Exercise Type Distribution */}
            <ExerciseTypeDistributionChart
              data={data.typeDistribution}
              title={t('charts.typeDistribution')}
              translations={{
                neuro: t('filters.neuro'),
                ortho: t('filters.ortho'),
                kine: t('filters.kine'),
                ergo: t('filters.ergo'),
              }}
            />

            {/* Difficulty Distribution */}
            <DifficultyDistributionChart
              data={data.difficultyDistribution}
              title={t('charts.difficultyDistribution')}
              translations={{
                easy: t('difficulty.easy'),
                medium: t('difficulty.medium'),
                hard: t('difficulty.hard'),
                all: t('difficulty.all'),
              }}
            />
          </div>

        </div>
      )}
    </div>
  )
}
