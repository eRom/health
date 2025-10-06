export interface DashboardStats {
  totalExercises: number
  totalDuration: number // en secondes
  averageScore: number | null
  recentStreak: number // jours consécutifs
}

export interface RecentExercise {
  id: string
  exerciseSlug: string
  score: number | null
  duration: number | null
  completedAt: Date
}

export interface SeedExerciseAttempt {
  exerciseSlug: string
  score: number
  duration: number
  completedAt: Date
}
