import type { ExerciseDifficulty } from '@/lib/types/exercise'

// Difficulty level configuration
export interface DifficultyLevel {
  value: ExerciseDifficulty | 'all'
  label: string
  color?: string
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'easy', label: 'Facile', color: 'bg-green-500' },
  { value: 'medium', label: 'Moyen', color: 'bg-yellow-500' },
  { value: 'hard', label: 'Difficile', color: 'bg-red-500' },
]

/**
 * Get the Tailwind color class for a difficulty level
 */
export function getDifficultyColor(difficulty: string): string {
  const level = DIFFICULTY_LEVELS.find((d) => d.value === difficulty)
  return level?.color || 'bg-gray-500'
}

/**
 * Get the localized label for a difficulty level
 */
export function getDifficultyLabel(difficulty: string): string {
  const level = DIFFICULTY_LEVELS.find((d) => d.value === difficulty)
  return level?.label || difficulty
}
