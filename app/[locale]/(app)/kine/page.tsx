'use client'

import { useState, useEffect } from 'react'
import type { LocalizedExercise } from '@/lib/types/exercise'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DIFFICULTY_LEVELS,
  getDifficultyColor,
  getDifficultyLabel,
} from '@/lib/constants/exercise'

// Types d'exercices de kinésithérapie
const exerciseTypes = [
  { value: 'all', label: 'Tous les exercices' },
  { value: 'mobility', label: 'Mobilité articulaire' },
  { value: 'strength', label: 'Renforcement musculaire' },
  { value: 'balance', label: 'Équilibre' },
  { value: 'coordination', label: 'Coordination' },
  { value: 'stretching', label: 'Étirements' },
]

export default function KinePage() {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [exercises, setExercises] = useState<LocalizedExercise[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch exercises from API
  useEffect(() => {
    async function loadExercises() {
      try {
        const response = await fetch('/api/exercises/kine')
        const data = await response.json()
        setExercises(data.exercises || [])
      } catch (error) {
        console.error('Error loading exercises:', error)
      } finally {
        setLoading(false)
      }
    }
    loadExercises()
  }, [])

  const filteredExercises = exercises.filter((exercise) => {
    const typeMatch = selectedType === 'all' || exercise.category === selectedType
    const difficultyMatch =
      selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty
    return typeMatch && difficultyMatch
  })

  const getTypeLabel = (type: string) => {
    const exerciseType = exerciseTypes.find((t) => t.value === type)
    return exerciseType?.label || type
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Exercices de Kinésithérapie</h1>
          <p className="text-muted-foreground">
            Renforcez votre mobilité et votre autonomie avec des exercices adaptés
          </p>
        </div>
        <div className="text-center text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Exercices de Kinésithérapie</h1>
        <p className="text-muted-foreground">
          Renforcez votre mobilité et votre autonomie avec des exercices adaptés
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-64" aria-label="Type d'exercice">
              <SelectValue placeholder="Type d'exercice" />
            </SelectTrigger>
            <SelectContent>
              {exerciseTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-64" aria-label="Niveau de difficulté">
              <SelectValue placeholder="Niveau de difficulté" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille d'exercices */}
      {filteredExercises.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="Aucun exercice trouvé"
          description="Aucun exercice ne correspond aux filtres sélectionnés. Essayez de modifier vos critères de recherche."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.slug} className="flex flex-col">
              <CardHeader>
                <div className="mb-4 text-5xl" aria-hidden="true">{exercise.icon}</div>
                <CardTitle className="text-xl">{exercise.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="mb-4 text-sm text-muted-foreground">{exercise.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{getTypeLabel(exercise.category)}</Badge>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </Badge>
                  <Badge variant="secondary">{exercise.duration} min</Badge>
                </div>
              </CardContent>
              <CardFooter>
                {exercise.available ? (
                  <Button className="w-full" aria-label={`Commencer l'exercice ${exercise.title}`}>
                    Commencer l&apos;exercice
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled aria-label="Exercice à venir">
                    À venir
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
