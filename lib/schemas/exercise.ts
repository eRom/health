import { z } from 'zod'

// Zod schemas for exercise data validation

export const ExerciseContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  instructions: z.string().min(1),
})

export const ExerciseConfigSchema = z.record(z.string(), z.unknown()).optional()

export const ExerciseSchema = z.object({
  slug: z.string().min(1),
  type: z.enum(['neuro', 'ortho', 'ergo', 'kine']),
  category: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard', 'all']),
  duration: z.number().int().positive(),
  icon: z.string().optional(),
  available: z.boolean(),
  position: z.number().int().nonnegative(),
  content: z.object({
    fr: ExerciseContentSchema,
    en: ExerciseContentSchema,
  }),
  config: ExerciseConfigSchema,
})

export const ExerciseCatalogueSchema = z.object({
  exercises: z.array(ExerciseSchema),
})

// Server action schemas

export const SubmitExerciseAttemptSchema = z.object({
  exerciseSlug: z.string().min(1),
  score: z.number().min(0).max(100).optional(),
  duration: z.number().int().positive().optional(), // seconds
  data: z.record(z.string(), z.unknown()).optional(),
})
