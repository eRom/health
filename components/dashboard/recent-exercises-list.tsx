import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Dumbbell, Brain } from 'lucide-react'
import type { RecentExercise } from '@/lib/types/dashboard'

interface RecentExercisesListProps {
  exercises: RecentExercise[]
  translations: {
    title: string
    noExercises: string
    noExercisesDescription: string
  }
}

function getExerciseCategory(slug: string): 'neuro' | 'ortho' {
  const neuroSlugs = [
    'empan-lettres-audio',
    'empan-chiffres',
    'memoire-travail',
    'attention-soutenue',
  ]
  return neuroSlugs.includes(slug) ? 'neuro' : 'ortho'
}

function formatExerciseTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatRelativeTime(date: Date, locale: string): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return locale === 'fr' ? `Il y a ${diffMins} min` : `${diffMins} min ago`
  }
  if (diffHours < 24) {
    return locale === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`
  }
  return locale === 'fr' ? `Il y a ${diffDays}j` : `${diffDays}d ago`
}

export function RecentExercisesList({
  exercises,
  translations,
}: RecentExercisesListProps) {
  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Dumbbell}
            title={translations.noExercises}
            description={translations.noExercisesDescription}
            action={{
              label: 'Explorer les exercices',
              href: '/neuro',
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exercises.map((exercise) => {
            const category = getExerciseCategory(exercise.exerciseSlug)
            const Icon = category === 'neuro' ? Brain : Dumbbell

            return (
              <div
                key={exercise.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      category === 'neuro'
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {formatExerciseTitle(exercise.exerciseSlug)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(exercise.completedAt, 'fr')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {exercise.score !== null && (
                    <p className="font-semibold">
                      {exercise.score.toFixed(0)}%
                    </p>
                  )}
                  {exercise.duration !== null && (
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(exercise.duration / 60)}:{String(exercise.duration % 60).padStart(2, '0')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
