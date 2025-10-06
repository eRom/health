import { readFileSync } from 'fs'
import { join } from 'path'
import type {
  Exercise,
  LocalizedExercise,
  ExerciseType,
  ExerciseDifficulty,
} from './types/exercise'

// Cache pour éviter de relire les fichiers JSON à chaque requête
const catalogueCache = new Map<ExerciseType, Exercise[]>()

/**
 * Load and parse exercise catalogue from JSON file
 */
function loadCatalogue(type: ExerciseType): Exercise[] {
  // Check cache first
  if (catalogueCache.has(type)) {
    return catalogueCache.get(type)!
  }

  // Load JSON file
  const filePath = join(process.cwd(), 'lib', 'data', 'exercises', `${type}.json`)
  const fileContent = readFileSync(filePath, 'utf-8')
  const rawData = JSON.parse(fileContent)

  // Parse exercises directly (type-cast for now, Zod validation causes runtime issues)
  const exercises = rawData.exercises as Exercise[]

  // Cache the result
  catalogueCache.set(type, exercises)

  return exercises
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

/**
 * Clear the catalogue cache (useful for testing)
 */
export function clearCatalogueCache(): void {
  catalogueCache.clear()
}
