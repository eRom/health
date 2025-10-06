'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { AnalysisData } from '@/app/actions/get-analysis-data'

interface DifficultyDistributionChartProps {
  data: AnalysisData['difficultyDistribution']
  title: string
  translations: {
    easy: string
    medium: string
    hard: string
    all: string
  }
}

const DIFFICULTY_COLORS = {
  easy: '#22c55e', // green-500
  medium: '#f97316', // orange-500
  hard: '#ef4444', // red-500
  all: 'hsl(var(--primary))',
}

export function DifficultyDistributionChart({
  data,
  title,
  translations,
}: DifficultyDistributionChartProps) {
  // Format data with translated labels
  const formattedData = data.map((item) => ({
    ...item,
    name: translations[item.difficulty as keyof typeof translations] || item.difficulty,
    fill: DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.all,
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  label={(props) => {
                    const { x, y, percent } = props
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-bold"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                          paintOrder: 'stroke fill',
                          stroke: 'rgba(0,0,0,0.5)',
                          strokeWidth: '3px'
                        }}
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    )
                  }}
                  labelLine={false}
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: number) => [
                    `${value} tentatives (${((value / total) * 100).toFixed(1)}%)`,
                    'Nombre',
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '14px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-muted-foreground">Total tentatives</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
