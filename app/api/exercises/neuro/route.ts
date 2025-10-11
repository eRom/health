import { NextRequest, NextResponse } from 'next/server'
import { getExercises } from '@/lib/exercises'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Get locale from query params or default to 'fr'
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('locale') as 'fr' | 'en') || 'fr'

    // Load exercises from JSON
    const exercises = getExercises('neuro', locale)

    return NextResponse.json({
      success: true,
      exercises,
    })
  } catch (error) {
    logger.error(error, 'Error loading neuro exercises')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load exercises',
        exercises: [],
      },
      { status: 500 }
    )
  }
}
