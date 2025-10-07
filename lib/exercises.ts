import type {
  Exercise,
  LocalizedExercise,
  ExerciseType,
  ExerciseDifficulty,
} from './types/exercise'

// Import JSON catalogues directly (works better with Vercel bundling)
import neuroData from './data/exercises/neuro.json'
import orthoData from './data/exercises/ortho.json'
import kineData from './data/exercises/kine.json'
import ergoData from './data/exercises/ergo.json'

// Static catalogue map (cast to proper types since JSON imports are not fully typed)
const catalogues: Record<ExerciseType, { exercises: Exercise[] }> = {
  neuro: neuroData as { exercises: Exercise[] },
  ortho: orthoData as { exercises: Exercise[] },
  kine: kineData as { exercises: Exercise[] },
  ergo: ergoData as { exercises: Exercise[] },
}

/**
 * Load and parse exercise catalogue from imported JSON
 */
function loadCatalogue(type: ExerciseType): Exercise[] {
  return catalogues[type].exercises
}

/**
 * Get all exercises of a given type, localized
 */
export function getExercises(
  type: ExerciseType,
  locale: 'fr' | 'en' = 'fr'
): LocalizedExercise[] {
  const exercises = loadCatalogue(type)

  return exercises
    .sort((a, b) => a.position - b.position)
    .map((exercise) => ({
      slug: exercise.slug,
      type: exercise.type,
      category: exercise.category,
      difficulty: exercise.difficulty,
      duration: exercise.duration,
      icon: exercise.icon,
      available: exercise.available,
      position: exercise.position,
      config: exercise.config,
      locale,
      // Spread localized content
      ...exercise.content[locale],
    }))
}

/**
 * Get a single exercise by slug, localized
 */
export function getExerciseBySlug(
  slug: string,
  type: ExerciseType,
  locale: 'fr' | 'en' = 'fr'
): LocalizedExercise | null {
  const exercises = loadCatalogue(type)
  const exercise = exercises.find((ex) => ex.slug === slug)

  if (!exercise) {
    return null
  }

  return {
    slug: exercise.slug,
    type: exercise.type,
    category: exercise.category,
    difficulty: exercise.difficulty,
    duration: exercise.duration,
    icon: exercise.icon,
    available: exercise.available,
    position: exercise.position,
    config: exercise.config,
    locale,
    ...exercise.content[locale],
  }
}

/**
 * Get exercises filtered by category
 */
export function getExercisesByCategory(
  type: ExerciseType,
  category: string,
  locale: 'fr' | 'en' = 'fr'
): LocalizedExercise[] {
  const exercises = getExercises(type, locale)
  return exercises.filter((ex) => ex.category === category)
}

/**
 * Get only available exercises
 */
export function getAvailableExercises(
  type: ExerciseType,
  locale: 'fr' | 'en' = 'fr'
): LocalizedExercise[] {
  const exercises = getExercises(type, locale)
  return exercises.filter((ex) => ex.available)
}

/**
 * Get exercises filtered by difficulty
 */
export function getExercisesByDifficulty(
  type: ExerciseType,
  difficulty: ExerciseDifficulty,
  locale: 'fr' | 'en' = 'fr'
): LocalizedExercise[] {
  const exercises = getExercises(type, locale)
  return exercises.filter((ex) => ex.difficulty === difficulty)
}

/**
 * Get all unique categories for a given exercise type
 */
export function getCategories(type: ExerciseType): string[] {
  const exercises = loadCatalogue(type)
  const categories = exercises.map((ex) => ex.category)
  return Array.from(new Set(categories))
}

