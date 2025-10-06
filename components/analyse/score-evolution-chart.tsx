'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { AnalysisData } from '@/app/actions/get-analysis-data'

interface ScoreEvolutionChartProps {
  data: AnalysisData['scoreEvolution']
  title: string
}

export function ScoreEvolutionChart({ data, title }: ScoreEvolutionChartProps) {
  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    }),
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
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="displayDate"
                className="text-xs"
                stroke="rgba(255, 255, 255, 0.9)"
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
                itemStyle={{ color: 'hsl(var(--primary))' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{ fill: '#22d3ee', r: 5, strokeWidth: 2, stroke: '#06b6d4' }}
                activeDot={{ r: 7, fill: '#22d3ee', stroke: '#06b6d4', strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
