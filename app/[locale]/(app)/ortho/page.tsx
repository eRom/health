'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Types d'exercices orthophoniques
const exerciseTypes = [
  { value: 'all', label: 'Tous les exercices' },
  { value: 'articulation', label: 'Articulation' },
  { value: 'phonology', label: 'Phonologie' },
  { value: 'language', label: 'Langage oral' },
  { value: 'reading', label: 'Lecture' },
  { value: 'writing', label: 'Écriture' },
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
    id: 1,
    title: 'Sons et syllabes',
    description: 'Reconnaissance et production de syllabes simples',
    type: 'phonology',
    difficulty: 'easy',
    duration: '10 min',
    icon: '🗣️',
  },
  {
    id: 2,
    title: 'Répétition de mots',
    description: 'Exercices de répétition pour améliorer l\'articulation',
    type: 'articulation',
    difficulty: 'easy',
    duration: '12 min',
    icon: '👄',
  },
  {
    id: 3,
    title: 'Dénomination d\'images',
    description: 'Nommer des objets et des actions',
    type: 'language',
    difficulty: 'medium',
    duration: '15 min',
    icon: '🖼️',
  },
  {
    id: 4,
    title: 'Compréhension de texte',
    description: 'Lire et comprendre des passages courts',
    type: 'reading',
    difficulty: 'medium',
    duration: '20 min',
    icon: '📖',
  },
  {
    id: 5,
    title: 'Dictée de phrases',
    description: 'Écouter et écrire des phrases simples',
    type: 'writing',
    difficulty: 'medium',
    duration: '15 min',
    icon: '✍️',
  },
  {
    id: 6,
    title: 'Discrimination phonémique',
    description: 'Différencier des sons proches',
    type: 'phonology',
    difficulty: 'hard',
    duration: '18 min',
    icon: '👂',
  },
  {
    id: 7,
    title: 'Construction de phrases',
    description: 'Structurer des phrases complexes',
    type: 'language',
    difficulty: 'hard',
    duration: '25 min',
    icon: '💬',
  },
  {
    id: 8,
    title: 'Virelangues',
    description: 'Phrases difficiles pour travailler la fluidité',
    type: 'articulation',
    difficulty: 'hard',
    duration: '10 min',
    icon: '🌪️',
  },
]

export default function OrthoPage() {
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
        <h1 className="mb-2 text-3xl font-bold">Exercices Orthophoniques</h1>
        <p className="text-muted-foreground">
          Améliorez votre communication avec des exercices de rééducation du langage
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
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Aucun exercice ne correspond à vos filtres</p>
        </div>
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
                <Button className="w-full">Commencer l&apos;exercice</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
