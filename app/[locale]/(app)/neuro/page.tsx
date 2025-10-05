'use client'

import { useState } from 'react'
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

// Types d'exercices neuropsychologiques
const exerciseTypes = [
  { value: 'all', label: 'Tous les exercices' },
  { value: 'memory', label: 'Mémoire' },
  { value: 'attention', label: 'Attention' },
  { value: 'executive', label: 'Fonctions exécutives' },
  { value: 'spatial', label: 'Capacités visuo-spatiales' },
]

// Niveaux de difficulté
const difficultyLevels = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'easy', label: 'Facile', color: 'bg-green-500' },
  { value: 'medium', label: 'Moyen', color: 'bg-yellow-500' },
  { value: 'hard', label: 'Difficile', color: 'bg-red-500' },
]

// Exercices factices pour la démo
const exercises = [
  {
    id: 5,
    title: 'Mémoire de travail',
    description: 'Maintenir et manipuler des informations',
    type: 'memory',
    difficulty: 'medium',
    duration: '15 min',
    icon: '🧠',
    available: true,
  },
  {
    id: 1,
    title: 'Séquences de nombres',
    description: 'Mémoriser et restituer des séquences de chiffres',
    type: 'memory',
    difficulty: 'easy',
    duration: '10 min',
    icon: '🔢',
    available: false,
  },
  {
    id: 2,
    title: 'Attention sélective',
    description: 'Identifier des cibles parmi des distracteurs',
    type: 'attention',
    difficulty: 'medium',
    duration: '15 min',
    icon: '🎯',
    available: false,
  },
  {
    id: 3,
    title: 'Planning de tâches',
    description: 'Organiser et séquencer des actions complexes',
    type: 'executive',
    difficulty: 'hard',
    duration: '20 min',
    icon: '📋',
    available: false,
  },
  {
    id: 4,
    title: 'Rotation mentale',
    description: 'Manipuler mentalement des objets en 3D',
    type: 'spatial',
    difficulty: 'medium',
    duration: '12 min',
    icon: '🔄',
    available: false,
  },
  {
    id: 6,
    title: 'Attention divisée',
    description: 'Gérer plusieurs tâches simultanément',
    type: 'attention',
    difficulty: 'hard',
    duration: '18 min',
    icon: '⚡',
    available: false,
  },
]

export default function NeuroPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  const filteredExercises = exercises.filter((exercise) => {
    const typeMatch = selectedType === 'all' || exercise.type === selectedType
    const difficultyMatch =
      selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty
    return typeMatch && difficultyMatch
  })

  const getDifficultyColor = (difficulty: string) => {
    const level = difficultyLevels.find((d) => d.value === difficulty)
    return level?.color || 'bg-gray-500'
  }

  const getDifficultyLabel = (difficulty: string) => {
    const level = difficultyLevels.find((d) => d.value === difficulty)
    return level?.label || difficulty
  }

  const getTypeLabel = (type: string) => {
    const exerciseType = exerciseTypes.find((t) => t.value === type)
    return exerciseType?.label || type
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Exercices Neuropsychologiques</h1>
        <p className="text-muted-foreground">
          Entraînez vos capacités cognitives avec des exercices ciblés
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-64">
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
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Niveau de difficulté" />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
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
            <Card key={exercise.id} className="flex flex-col">
              <CardHeader>
                <div className="mb-4 text-5xl">{exercise.icon}</div>
                <CardTitle className="text-xl">{exercise.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="mb-4 text-sm text-muted-foreground">{exercise.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{getTypeLabel(exercise.type)}</Badge>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </Badge>
                  <Badge variant="secondary">{exercise.duration}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                {exercise.available ? (
                  <Button className="w-full">Commencer l&apos;exercice</Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
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
