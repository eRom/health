'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { getExercises } from '@/lib/exercises'

export interface AnalysisData {
  kpis: {
    totalAttempts: number
    totalDuration: number
    averageScore: number
    consistency: number
    trends: {
      attempts: number
      duration: number
      score: number
      consistency: number
    }
  }
  scoreEvolution: Array<{
    date: string
    score: number
    count: number
  }>
  exercisePerformance: Array<{
    slug: string
    name: string
    averageScore: number
    count: number
    difficulty: string
    type: string
  }>
  difficultyDistribution: Array<{
    difficulty: string
    count: number
    percentage: number
  }>
  typeDistribution: Array<{
    type: string
    count: number
    percentage: number
  }>
  difficultyByType: Array<{
    type: string
    difficulties: Array<{
      difficulty: string
      count: number
      percentage: number
    }>
  }>
}

type TimeRange = '7d' | '30d' | '90d' | 'all'
type ExerciseType = 'all' | 'neuro' | 'ortho'
type Category = 'all' | string

interface AnalysisFilters {
  timeRange: TimeRange
  exerciseType: ExerciseType
  category: Category
  locale?: 'fr' | 'en'
}

export async function getAnalysisData(
  filters: AnalysisFilters = {
    timeRange: '30d',
    exerciseType: 'all',
    category: 'all',
    locale: 'fr',
  }
): Promise<AnalysisData> {
  // 1. Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id
  const locale = filters.locale || 'fr'

  // 2. Calculate date range
  const now = new Date()
  let startDate: Date

  switch (filters.timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'all':
    default:
      startDate = new Date(0) // Unix epoch
  }

  // 3. Build where clause
  const whereClause: {
    userId: string
    completedAt: { gte: Date; lt?: Date }
    exerciseSlug?: { in: string[] }
  } = {
    userId,
    completedAt: {
      gte: startDate,
    },
  }

  // Load exercise metadata to filter by type/category
  const neuroExercises = getExercises('neuro', locale)
  const orthoExercises = getExercises('ortho', locale)
  const kineExercises = getExercises('kine', locale)
  const ergoExercises = getExercises('ergo', locale)
  const allExercises = [...neuroExercises, ...orthoExercises, ...kineExercises, ...ergoExercises]

  // Debug: Log catalogue info
  if (process.env.NODE_ENV === 'development') {
    console.log('[getAnalysisData] Catalogue loaded:', {
      neuro: neuroExercises.length,
      ortho: orthoExercises.length,
      kine: kineExercises.length,
      ergo: ergoExercises.length,
      total: allExercises.length,
      slugs: allExercises.map(ex => ex.slug)
    })
  }

  // Filter by type
  if (filters.exerciseType !== 'all') {
    const exerciseSlugs = allExercises
      .filter((ex) => ex.type === filters.exerciseType)
      .map((ex) => ex.slug)
    whereClause.exerciseSlug = { in: exerciseSlugs }
  }

  // Filter by category
  if (filters.category !== 'all') {
    const exerciseSlugs = allExercises
      .filter((ex) => ex.category === filters.category)
      .map((ex) => ex.slug)
    whereClause.exerciseSlug = { in: exerciseSlugs }
  }

  // 4. Fetch all attempts for current period
  const attempts = await prisma.exerciseAttempt.findMany({
    where: whereClause,
    orderBy: { completedAt: 'asc' },
    select: {
      id: true,
      exerciseSlug: true,
      score: true,
      duration: true,
      completedAt: true,
      data: true,
    },
  })

  // Debug: Log query results
  if (process.env.NODE_ENV === 'development') {
    console.log('[getAnalysisData] Filter:', JSON.stringify(filters))
    console.log('[getAnalysisData] Where clause:', JSON.stringify(whereClause, null, 2))
    console.log('[getAnalysisData] Attempts found:', attempts.length)
    if (attempts.length > 0) {
      console.log('[getAnalysisData] Sample attempt:', JSON.stringify(attempts[0], null, 2))
    }
  }

  // 5. Calculate previous period for trends
  const periodDuration = now.getTime() - startDate.getTime()
  const prevStartDate = new Date(startDate.getTime() - periodDuration)

  const prevWhereClause = {
    ...whereClause,
    completedAt: {
      gte: prevStartDate,
      lt: startDate,
    },
  }

  const prevAttempts = await prisma.exerciseAttempt.findMany({
    where: prevWhereClause,
    select: {
      score: true,
      duration: true,
      completedAt: true,
    },
  })

  // 6. Calculate KPIs
  const totalAttempts = attempts.length
  const totalDuration = attempts.reduce((sum, a) => sum + (a.duration || 0), 0)
  const validScores = attempts.filter((a) => a.score !== null)
  const averageScore =
    validScores.length > 0
      ? validScores.reduce((sum, a) => sum + (a.score || 0), 0) / validScores.length
      : 0

  // Calculate consistency (% of days with at least 1 attempt)
  const uniqueDays = new Set(
    attempts.map((a) => new Date(a.completedAt).toISOString().split('T')[0])
  ).size
  const totalDays = Math.ceil(periodDuration / (24 * 60 * 60 * 1000))
  const consistency = totalDays > 0 ? (uniqueDays / totalDays) * 100 : 0

  // Previous period stats
  const prevTotalAttempts = prevAttempts.length
  const prevTotalDuration = prevAttempts.reduce((sum, a) => sum + (a.duration || 0), 0)
  const prevValidScores = prevAttempts.filter((a) => a.score !== null)
  const prevAverageScore =
    prevValidScores.length > 0
      ? prevValidScores.reduce((sum, a) => sum + (a.score || 0), 0) / prevValidScores.length
      : 0
  const prevUniqueDays = new Set(
    prevAttempts.map((a) => new Date(a.completedAt).toISOString().split('T')[0])
  ).size
  const prevConsistency = totalDays > 0 ? (prevUniqueDays / totalDays) * 100 : 0

  // Calculate trends (% change)
  const trends = {
    attempts:
      prevTotalAttempts > 0
        ? ((totalAttempts - prevTotalAttempts) / prevTotalAttempts) * 100
        : 0,
    duration:
      prevTotalDuration > 0
        ? ((totalDuration - prevTotalDuration) / prevTotalDuration) * 100
        : 0,
    score: prevAverageScore > 0 ? ((averageScore - prevAverageScore) / prevAverageScore) * 100 : 0,
    consistency:
      prevConsistency > 0 ? ((consistency - prevConsistency) / prevConsistency) * 100 : 0,
  }

  // 7. Score evolution (group by day)
  const scoresByDay = new Map<string, { scores: number[]; count: number }>()

  attempts.forEach((attempt) => {
    const day = new Date(attempt.completedAt).toISOString().split('T')[0]
    if (!scoresByDay.has(day)) {
      scoresByDay.set(day, { scores: [], count: 0 })
    }
    const dayData = scoresByDay.get(day)!
    if (attempt.score !== null) {
      dayData.scores.push(attempt.score)
    }
    dayData.count++
  })

  const scoreEvolution = Array.from(scoresByDay.entries())
    .map(([date, data]) => ({
      date,
      score: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // 8. Exercise performance (group by exercise)
  const performanceByExercise = new Map<
    string,
    { scores: number[]; count: number; totalDuration: number }
  >()

  attempts.forEach((attempt) => {
    if (!performanceByExercise.has(attempt.exerciseSlug)) {
      performanceByExercise.set(attempt.exerciseSlug, {
        scores: [],
        count: 0,
        totalDuration: 0,
      })
    }
    const exerciseData = performanceByExercise.get(attempt.exerciseSlug)!
    if (attempt.score !== null) {
      exerciseData.scores.push(attempt.score)
    }
    exerciseData.count++
    exerciseData.totalDuration += attempt.duration || 0
  })

  const exercisePerformance = Array.from(performanceByExercise.entries())
    .map(([slug, data]) => {
      const exercise = allExercises.find((ex) => ex.slug === slug)

      // Get most common difficulty for this exercise from attempts
      const exerciseAttempts = attempts.filter((a) => a.exerciseSlug === slug)
      const difficultyCounts = new Map<string, number>()

      exerciseAttempts.forEach((attempt) => {
        if (attempt.data && typeof attempt.data === 'object') {
          const attemptData = attempt.data as { difficulty?: string }
          if (attemptData.difficulty) {
            difficultyCounts.set(attemptData.difficulty, (difficultyCounts.get(attemptData.difficulty) || 0) + 1)
          }
        }
      })

      // Get most common difficulty
      let difficulty: string = exercise?.difficulty || 'medium'
      if (difficultyCounts.size > 0) {
        const mostCommon = Array.from(difficultyCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
        difficulty = mostCommon
      }
      // Don't use 'all' as difficulty
      if (difficulty === 'all') {
        difficulty = 'medium'
      }

      return {
        slug,
        name: exercise?.title || slug,
        averageScore:
          data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
        count: data.count,
        difficulty,
        type: exercise?.type || 'neuro',
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 exercises

  // 9. Difficulty distribution - use data from attempts, not from exercise catalogue
  const difficultyMap = new Map<string, number>()

  attempts.forEach((attempt) => {
    // Try to get difficulty from attempt data first (stored during exercise completion)
    let difficulty = 'medium' // default

    if (attempt.data && typeof attempt.data === 'object') {
      const attemptData = attempt.data as { difficulty?: string }
      if (attemptData.difficulty) {
        difficulty = attemptData.difficulty
      }
    }

    // Fallback to exercise catalogue if not in data
    if (difficulty === 'medium' && !attempt.data) {
      const exercise = allExercises.find((ex) => ex.slug === attempt.exerciseSlug)
      if (exercise && exercise.difficulty !== 'all') {
        difficulty = exercise.difficulty
      }
    }

    difficultyMap.set(difficulty, (difficultyMap.get(difficulty) || 0) + 1)
  })

  const difficultyDistribution = Array.from(difficultyMap.entries())
    .map(([difficulty, count]) => ({
      difficulty,
      count,
      percentage: totalAttempts > 0 ? (count / totalAttempts) * 100 : 0,
    }))
    .sort((a, b) => {
      // Sort: easy, medium, hard
      const order = { easy: 1, medium: 2, hard: 3 }
      return (order[a.difficulty as keyof typeof order] || 2) - (order[b.difficulty as keyof typeof order] || 2)
    })

  // 10. Type distribution (group by exercise type)
  const typeMap = new Map<string, number>()

  attempts.forEach((attempt) => {
    // Find exercise type from catalogue
    const exercise = allExercises.find((ex) => ex.slug === attempt.exerciseSlug)
    const type = exercise?.type || 'neuro' // default to neuro if not found

    typeMap.set(type, (typeMap.get(type) || 0) + 1)
  })

  const typeDistribution = Array.from(typeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalAttempts > 0 ? (count / totalAttempts) * 100 : 0,
    }))
    .sort((a, b) => {
      // Sort: neuro, ortho, kine, ergo
      const order = { neuro: 1, ortho: 2, kine: 3, ergo: 4 }
      return (order[a.type as keyof typeof order] || 5) - (order[b.type as keyof typeof order] || 5)
    })

  // 11. Difficulty distribution by type
  const typeDifficultyMap = new Map<string, Map<string, number>>()

  attempts.forEach((attempt) => {
    // Find exercise type from catalogue
    const exercise = allExercises.find((ex) => ex.slug === attempt.exerciseSlug)
    const type = exercise?.type || 'neuro'

    // Get difficulty from attempt data or fallback to exercise catalogue
    let difficulty = 'medium'
    if (attempt.data && typeof attempt.data === 'object') {
      const attemptData = attempt.data as { difficulty?: string }
      if (attemptData.difficulty) {
        difficulty = attemptData.difficulty
      }
    } else if (exercise && exercise.difficulty !== 'all') {
      difficulty = exercise.difficulty
    }

    // Initialize type map if needed
    if (!typeDifficultyMap.has(type)) {
      typeDifficultyMap.set(type, new Map<string, number>())
    }

    const diffMap = typeDifficultyMap.get(type)!
    diffMap.set(difficulty, (diffMap.get(difficulty) || 0) + 1)
  })

  const difficultyByType = Array.from(typeDifficultyMap.entries())
    .map(([type, diffMap]) => {
      const typeTotal = Array.from(diffMap.values()).reduce((sum, count) => sum + count, 0)
      const difficulties = Array.from(diffMap.entries())
        .map(([difficulty, count]) => ({
          difficulty,
          count,
          percentage: typeTotal > 0 ? (count / typeTotal) * 100 : 0,
        }))
        .sort((a, b) => {
          // Sort: easy, medium, hard
          const order = { easy: 1, medium: 2, hard: 3 }
          return (order[a.difficulty as keyof typeof order] || 2) - (order[b.difficulty as keyof typeof order] || 2)
        })

      return {
        type,
        difficulties,
      }
    })
    .sort((a, b) => {
      // Sort: neuro, ortho, kine, ergo
      const order = { neuro: 1, ortho: 2, kine: 3, ergo: 4 }
      return (order[a.type as keyof typeof order] || 5) - (order[b.type as keyof typeof order] || 5)
    })

  // 12. Return aggregated data
  return {
    kpis: {
      totalAttempts,
      totalDuration,
      averageScore,
      consistency,
      trends,
    },
    scoreEvolution,
    exercisePerformance,
    difficultyDistribution,
    typeDistribution,
    difficultyByType,
  }
}
