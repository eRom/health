'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type TimeRange = '7d' | '30d' | '90d' | 'all'
export type ExerciseType = 'all' | 'neuro' | 'ortho'

interface TimeRangeFilterProps {
  timeRange: TimeRange
  exerciseType: ExerciseType
  onTimeRangeChange: (range: TimeRange) => void
  onExerciseTypeChange: (type: ExerciseType) => void
}

export function TimeRangeFilter({
  timeRange,
  exerciseType,
  onTimeRangeChange,
  onExerciseTypeChange,
}: TimeRangeFilterProps) {
  const t = useTranslations('analyse.filters')

  const timeRanges: TimeRange[] = ['7d', '30d', '90d', 'all']

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Time Range Buttons */}
      <div role="group" aria-label={t('timeRange')} className="flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeRangeChange(range)}
            aria-pressed={timeRange === range}
          >
            {t(range)}
          </Button>
        ))}
      </div>

      {/* Exercise Type Select */}
      <div className="flex items-center gap-2">
        <label htmlFor="exercise-type-select" className="text-sm font-medium">
          {t('exerciseType')}
        </label>
        <Select value={exerciseType} onValueChange={(value) => onExerciseTypeChange(value as ExerciseType)}>
          <SelectTrigger id="exercise-type-select" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            <SelectItem value="neuro">{t('neuro')}</SelectItem>
            <SelectItem value="ortho">{t('ortho')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
