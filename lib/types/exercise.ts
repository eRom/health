import type { z } from 'zod'
import type {
  ExerciseSchema,
  ExerciseContentSchema,
  ExerciseCatalogueSchema,
  SubmitExerciseAttemptSchema,
} from '../schemas/exercise'

// TypeScript types inferred from Zod schemas

export type ExerciseContent = z.infer<typeof ExerciseContentSchema>

export type Exercise = z.infer<typeof ExerciseSchema>

export type ExerciseCatalogue = z.infer<typeof ExerciseCatalogueSchema>

export type SubmitExerciseAttempt = z.infer<typeof SubmitExerciseAttemptSchema>

// Localized exercise type (after i18n)
export type LocalizedExercise = Omit<Exercise, 'content'> &
  ExerciseContent & {
    locale: string
  }

// Exercise type filter options
export type ExerciseType = Exercise['type']
export type ExerciseCategory = string
export type ExerciseDifficulty = Exercise['difficulty']
