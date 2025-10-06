'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { AnalysisData } from '@/app/actions/get-analysis-data'

interface ExercisePerformanceChartProps {
  data: AnalysisData['exercisePerformance']
  title: string
}

const DIFFICULTY_COLORS = {
  easy: '#22c55e', // green-500
  medium: '#f97316', // orange-500
  hard: '#ef4444', // red-500
  all: 'hsl(var(--primary))',
}

export function ExercisePerformanceChart({ data, title }: ExercisePerformanceChartProps) {
  // Truncate long exercise names for display
  const formattedData = data.map((item) => ({
    ...item,
    displayName: item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name,
  }))

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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="displayName"
                className="text-xs"
                stroke="rgba(255, 255, 255, 0.9)"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: 'rgba(255, 255, 255, 0.9)', fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                className="text-xs"
                stroke="rgba(255, 255, 255, 0.9)"
                label={{
                  value: 'Score (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: 'rgba(255, 255, 255, 0.9)', fontSize: 12 }
                }}
                tick={{ fill: 'rgba(255, 255, 255, 0.9)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--popover-foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                cursor={false}
                formatter={(value: number, _name: string, props: unknown) => [
                  `${value.toFixed(1)}%`,
                  `Score (${(props as { payload: { count: number } }).payload.count} tentatives)`,
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.name
                  }
                  return label
                }}
              />
              <Bar
                dataKey="averageScore"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                style={{ cursor: 'default' }}
              >
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.all}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
