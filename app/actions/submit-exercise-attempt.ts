'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubmitExerciseAttemptSchema } from '@/lib/schemas/exercise'
import { revalidatePath } from 'next/cache'

export async function submitExerciseAttempt(input: unknown) {
  try {
    // 1. Validate input with Zod
    const validated = SubmitExerciseAttemptSchema.parse(input)

    // 2. Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour soumettre une tentative',
      }
    }

    // 3. Create exercise attempt in database
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        exerciseSlug: validated.exerciseSlug,
        userId: session.user.id,
        score: validated.score,
        duration: validated.duration,
        data: validated.data || {},
      },
    })

    // 4. Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/neuro')
    revalidatePath('/ortho')

    return {
      success: true,
      attemptId: attempt.id,
    }
  } catch (error) {
    console.error('Error submitting exercise attempt:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}
