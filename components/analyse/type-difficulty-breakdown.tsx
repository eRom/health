'use client'

import type { AnalysisData } from '@/app/actions/get-analysis-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface TypeDifficultyBreakdownProps {
  data: AnalysisData['difficultyByType']
  translations: {
    types: {
      neuro: string
      ortho: string
      kine: string
      ergo: string
    }
    difficulties: {
      easy: string
      medium: string
      hard: string
    }
  }
}

const DIFFICULTY_COLORS = {
  easy: '#22c55e', // green-500
  medium: '#f97316', // orange-500
  hard: '#ef4444', // red-500
}

export function TypeDifficultyBreakdown({ data, translations }: TypeDifficultyBreakdownProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {data.map((typeData) => {
        const typeName = translations.types[typeData.type as keyof typeof translations.types] || typeData.type

        // Format data for the chart
        const chartData = typeData.difficulties.map((diff) => ({
          name: translations.difficulties[diff.difficulty as keyof typeof translations.difficulties] || diff.difficulty,
          value: diff.percentage,
          count: diff.count,
          difficulty: diff.difficulty,
        }))

        const total = typeData.difficulties.reduce((sum, d) => sum + d.count, 0)

        return (
          <Card key={typeData.type} className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{typeName}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              {chartData.length === 0 ? (
                <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
                  Aucune donnée disponible
                </div>
              ) : (
                <div className="space-y-3">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={chartData}
                      layout="horizontal"
                      margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        stroke="#ffffff"
                        tick={{ fill: '#ffffff', fontSize: 11 }}
                        axisLine={{ stroke: '#ffffff' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#ffffff"
                        tick={{ fill: '#ffffff', fontSize: 11 }}
                        axisLine={{ stroke: '#ffffff' }}
                        width={70}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        isAnimationActive={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      {total} tentative{total > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
