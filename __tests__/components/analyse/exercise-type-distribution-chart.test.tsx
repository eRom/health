import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExerciseTypeDistributionChart } from '@/components/analyse/exercise-type-distribution-chart'
import type { AnalysisData } from '@/app/actions/get-analysis-data'

describe('ExerciseTypeDistributionChart', () => {
  const mockTranslations = {
    neuro: 'Neuropsychologie',
    ortho: 'Orthophonie',
    kine: 'Kinésithérapie',
    ergo: 'Ergothérapie',
  }

  const mockData: AnalysisData['typeDistribution'] = [
    { type: 'neuro', count: 50, percentage: 40 },
    { type: 'ortho', count: 40, percentage: 32 },
    { type: 'kine', count: 20, percentage: 16 },
    { type: 'ergo', count: 15, percentage: 12 },
  ]

  it('renders chart with data', () => {
    render(
      <ExerciseTypeDistributionChart
        data={mockData}
        title="Distribution par type"
        translations={mockTranslations}
      />
    )

    expect(screen.getByText('Distribution par type')).toBeInTheDocument()
    expect(screen.getByText('125')).toBeInTheDocument() // Total
    expect(screen.getByText('Total tentatives')).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(
      <ExerciseTypeDistributionChart
        data={[]}
        title="Distribution par type"
        translations={mockTranslations}
      />
    )

    expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument()
  })

  it('displays correct total count', () => {
    render(
      <ExerciseTypeDistributionChart
        data={mockData}
        title="Distribution par type"
        translations={mockTranslations}
      />
    )

    const total = mockData.reduce((sum, item) => sum + item.count, 0)
    expect(screen.getByText(total.toString())).toBeInTheDocument()
  })

  it('renders with single data point', () => {
    const singleData: AnalysisData['typeDistribution'] = [
      { type: 'neuro', count: 100, percentage: 100 },
    ]

    render(
      <ExerciseTypeDistributionChart
        data={singleData}
        title="Distribution par type"
        translations={mockTranslations}
      />
    )

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Total tentatives')).toBeInTheDocument()
  })

  it('handles missing translation gracefully', () => {
    const dataWithUnknownType: AnalysisData['typeDistribution'] = [
      { type: 'unknown', count: 10, percentage: 100 },
    ]

    render(
      <ExerciseTypeDistributionChart
        data={dataWithUnknownType}
        title="Distribution par type"
        translations={mockTranslations}
      />
    )

    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
