import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAnalysisData } from '@/app/actions/get-analysis-data'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    exerciseAttempt: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/exercises', () => ({
  getExercises: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getExercises } from '@/lib/exercises'

describe('getAnalysisData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error when user is not authenticated', async () => {
    // Mock unauthenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    await expect(getAnalysisData()).rejects.toThrow('Unauthorized')
  })

  it('returns analysis data with default filters', async () => {
    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test' },
      session: { id: 'session-123', userId: 'user-123', expiresAt: new Date(), token: '', createdAt: new Date(), updatedAt: new Date(), ipAddress: '', userAgent: '' },
    })

    // Mock exercise catalogues
    vi.mocked(getExercises).mockImplementation((type) => {
      const exercises = {
        neuro: [
          { slug: 'neuro-1', title: 'Neuro Exercise 1', type: 'neuro', difficulty: 'easy', category: 'memory' },
        ],
        ortho: [
          { slug: 'ortho-1', title: 'Ortho Exercise 1', type: 'ortho', difficulty: 'medium', category: 'phonology' },
        ],
        kine: [
          { slug: 'kine-1', title: 'Kine Exercise 1', type: 'kine', difficulty: 'hard', category: 'mobility' },
        ],
        ergo: [
          { slug: 'ergo-1', title: 'Ergo Exercise 1', type: 'ergo', difficulty: 'medium', category: 'daily-activities' },
        ],
      }
      return exercises[type] || []
    })

    // Mock current period attempts
    const mockAttempts = [
      {
        id: '1',
        exerciseSlug: 'neuro-1',
        score: 85,
        duration: 120,
        completedAt: new Date('2025-01-08'),
        data: { difficulty: 'easy' },
      },
      {
        id: '2',
        exerciseSlug: 'ortho-1',
        score: 90,
        duration: 150,
        completedAt: new Date('2025-01-09'),
        data: { difficulty: 'medium' },
      },
    ]

    // Mock previous period attempts (empty)
    vi.mocked(prisma.exerciseAttempt.findMany)
      .mockResolvedValueOnce(mockAttempts as any) // Current period
      .mockResolvedValueOnce([]) // Previous period

    const result = await getAnalysisData({
      timeRange: '30d',
      exerciseType: 'all',
      category: 'all',
      locale: 'fr',
    })

    // Verify KPIs
    expect(result.kpis.totalAttempts).toBe(2)
    expect(result.kpis.totalDuration).toBe(270)
    expect(result.kpis.averageScore).toBe(87.5)
    expect(result.kpis.consistency).toBeGreaterThan(0)

    // Verify trends (should be 0 since previous period has no data)
    expect(result.kpis.trends.attempts).toBe(0)
    expect(result.kpis.trends.duration).toBe(0)
    expect(result.kpis.trends.score).toBe(0)

    // Verify score evolution
    expect(result.scoreEvolution).toHaveLength(2)
    expect(result.scoreEvolution[0].score).toBe(85)
    expect(result.scoreEvolution[1].score).toBe(90)

    // Verify exercise performance
    expect(result.exercisePerformance).toHaveLength(2)
    expect(result.exercisePerformance[0].slug).toBe('neuro-1')
    expect(result.exercisePerformance[0].averageScore).toBe(85)
    expect(result.exercisePerformance[0].difficulty).toBe('easy')
    expect(result.exercisePerformance[0].type).toBe('neuro')

    // Verify difficulty distribution
    expect(result.difficultyDistribution).toHaveLength(2)
    const easyDiff = result.difficultyDistribution.find(d => d.difficulty === 'easy')
    expect(easyDiff?.count).toBe(1)
    expect(easyDiff?.percentage).toBe(50)

    // Verify type distribution
    expect(result.typeDistribution).toHaveLength(2)
    const neuroType = result.typeDistribution.find(t => t.type === 'neuro')
    expect(neuroType?.count).toBe(1)
    expect(neuroType?.percentage).toBe(50)

    // Verify difficulty by type
    expect(result.difficultyByType).toHaveLength(2)
    expect(result.difficultyByType[0].type).toBe('neuro')
    expect(result.difficultyByType[0].difficulties).toHaveLength(1)
  })

  it('filters data by exercise type', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test' },
      session: { id: 'session-123', userId: 'user-123', expiresAt: new Date(), token: '', createdAt: new Date(), updatedAt: new Date(), ipAddress: '', userAgent: '' },
    })

    vi.mocked(getExercises).mockImplementation((type) => {
      const exercises = {
        neuro: [{ slug: 'neuro-1', title: 'Neuro 1', type: 'neuro', difficulty: 'easy', category: 'memory' }],
        ortho: [{ slug: 'ortho-1', title: 'Ortho 1', type: 'ortho', difficulty: 'medium', category: 'phonology' }],
        kine: [],
        ergo: [],
      }
      return exercises[type] || []
    })

    vi.mocked(prisma.exerciseAttempt.findMany)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    await getAnalysisData({
      timeRange: '30d',
      exerciseType: 'neuro',
      category: 'all',
      locale: 'fr',
    })

    // Verify that findMany was called with correct where clause
    const whereClause = vi.mocked(prisma.exerciseAttempt.findMany).mock.calls[0][0]?.where
    expect(whereClause?.exerciseSlug).toEqual({ in: ['neuro-1'] })
  })

  it('calculates trends correctly with previous period data', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test' },
      session: { id: 'session-123', userId: 'user-123', expiresAt: new Date(), token: '', createdAt: new Date(), updatedAt: new Date(), ipAddress: '', userAgent: '' },
    })

    vi.mocked(getExercises).mockImplementation((type) => {
      const exercises = {
        neuro: [{ slug: 'neuro-1', title: 'Neuro 1', type: 'neuro', difficulty: 'easy', category: 'memory' }],
        ortho: [],
        kine: [],
        ergo: [],
      }
      return exercises[type] || []
    })

    const currentPeriodAttempts = [
      { id: '1', exerciseSlug: 'neuro-1', score: 90, duration: 120, completedAt: new Date('2025-01-08'), data: {} },
      { id: '2', exerciseSlug: 'neuro-1', score: 95, duration: 130, completedAt: new Date('2025-01-09'), data: {} },
    ]

    const previousPeriodAttempts = [
      { id: '3', score: 80, duration: 100, completedAt: new Date('2024-12-08') },
    ]

    vi.mocked(prisma.exerciseAttempt.findMany)
      .mockResolvedValueOnce(currentPeriodAttempts as any)
      .mockResolvedValueOnce(previousPeriodAttempts as any)

    const result = await getAnalysisData()

    // Current: 2 attempts, Previous: 1 attempt → +100% trend
    expect(result.kpis.trends.attempts).toBe(100)

    // Current avg: 92.5, Previous avg: 80 → +15.625% trend
    expect(result.kpis.trends.score).toBeCloseTo(15.625, 2)

    // Current duration: 250, Previous: 100 → +150% trend
    expect(result.kpis.trends.duration).toBe(150)
  })

  it('handles time range filters correctly', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test' },
      session: { id: 'session-123', userId: 'user-123', expiresAt: new Date(), token: '', createdAt: new Date(), updatedAt: new Date(), ipAddress: '', userAgent: '' },
    })

    vi.mocked(getExercises).mockReturnValue([])
    vi.mocked(prisma.exerciseAttempt.findMany).mockResolvedValue([])

    // Test 7d range
    await getAnalysisData({ timeRange: '7d', exerciseType: 'all', category: 'all', locale: 'fr' })
    const call7d = vi.mocked(prisma.exerciseAttempt.findMany).mock.calls[0][0]?.where
    expect(call7d?.completedAt?.gte).toBeDefined()

    vi.clearAllMocks()

    // Test 90d range
    await getAnalysisData({ timeRange: '90d', exerciseType: 'all', category: 'all', locale: 'fr' })
    const call90d = vi.mocked(prisma.exerciseAttempt.findMany).mock.calls[0][0]?.where
    expect(call90d?.completedAt?.gte).toBeDefined()

    vi.clearAllMocks()

    // Test 'all' range
    await getAnalysisData({ timeRange: 'all', exerciseType: 'all', category: 'all', locale: 'fr' })
    const callAll = vi.mocked(prisma.exerciseAttempt.findMany).mock.calls[0][0]?.where
    expect(callAll?.completedAt?.gte).toEqual(new Date(0))
  })

  it('handles empty attempts gracefully', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test' },
      session: { id: 'session-123', userId: 'user-123', expiresAt: new Date(), token: '', createdAt: new Date(), updatedAt: new Date(), ipAddress: '', userAgent: '' },
    })

    vi.mocked(getExercises).mockReturnValue([])
    vi.mocked(prisma.exerciseAttempt.findMany).mockResolvedValue([])

    const result = await getAnalysisData()

    expect(result.kpis.totalAttempts).toBe(0)
    expect(result.kpis.averageScore).toBe(0)
    expect(result.kpis.totalDuration).toBe(0)
    expect(result.kpis.consistency).toBe(0)
    expect(result.scoreEvolution).toHaveLength(0)
    expect(result.exercisePerformance).toHaveLength(0)
    expect(result.difficultyDistribution).toHaveLength(0)
    expect(result.typeDistribution).toHaveLength(0)
  })
})
