'use server'

import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const GetPatientDetailsSchema = z.object({
  patientId: z.string()
})

export async function getPatientDetails(data: z.infer<typeof GetPatientDetailsSchema>) {
  try {
    const session = await requireHealthcareProviderOrAdmin()
    const { patientId } = GetPatientDetailsSchema.parse(data)
    
    // Vérifier que le patient est associé au soignant
    const association = await prisma.patientProviderAssociation.findFirst({
      where: {
        patientId,
        providerId: session.user.id,
        status: 'ACCEPTED'
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            emailVerified: true,
            healthDataConsentGrantedAt: true
          }
        }
      }
    })
    
    if (!association) {
      throw new Error('Patient non trouvé ou non associé')
    }
    
    // Récupérer les données d'exercices
    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        userId: patientId
      },
      select: {
        id: true,
        exerciseSlug: true,
        score: true,
        duration: true,
        completedAt: true,
        data: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    })
    
    // Calculer les statistiques
    const totalAttempts = exerciseAttempts.length
    const averageScore = totalAttempts > 0 
      ? exerciseAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts
      : 0
    
    const totalDuration = exerciseAttempts.reduce((sum, attempt) => sum + (attempt.duration || 0), 0)
    
    // Grouper par exercice
    const exerciseStats = exerciseAttempts.reduce((acc, attempt) => {
      if (!acc[attempt.exerciseSlug]) {
        acc[attempt.exerciseSlug] = {
          slug: attempt.exerciseSlug,
          count: 0,
          totalScore: 0,
          totalDuration: 0,
          lastAttempt: null
        }
      }
      acc[attempt.exerciseSlug].count++
      acc[attempt.exerciseSlug].totalScore += attempt.score || 0
      acc[attempt.exerciseSlug].totalDuration += attempt.duration || 0
      if (!acc[attempt.exerciseSlug].lastAttempt || attempt.completedAt > acc[attempt.exerciseSlug].lastAttempt!) {
        acc[attempt.exerciseSlug].lastAttempt = attempt.completedAt
      }
      return acc
    }, {} as Record<string, { slug: string; count: number; totalScore: number; totalDuration: number; lastAttempt: Date | null }>)
    
    // Calculer les moyennes par exercice
    Object.values(exerciseStats).forEach((stat) => {
      const statWithAverages = stat as typeof stat & { averageScore: number; averageDuration: number }
      statWithAverages.averageScore = stat.count > 0 ? stat.totalScore / stat.count : 0
      statWithAverages.averageDuration = stat.count > 0 ? stat.totalDuration / stat.count : 0
    })
    
    // Récupérer les messages
    const messages = await prisma.providerPatientMessage.findMany({
      where: {
        associationId: association.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    logger.info('[GET_PATIENT_DETAILS] Retrieved patient details', {
      providerId: session.user.id,
      patientId,
      totalAttempts,
      averageScore
    })
    
    return {
      patient: association.patient,
      association: {
        id: association.id,
        status: association.status,
        createdAt: association.createdAt,
        acceptedAt: association.acceptedAt
      },
      stats: {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        totalDuration,
        exerciseStats: Object.values(exerciseStats)
      },
      exerciseAttempts: exerciseAttempts.slice(0, 50), // Limiter à 50 derniers
      messages
    }
  } catch (error) {
    logger.error(error, '[GET_PATIENT_DETAILS] Error retrieving patient details')
    throw error
  }
}
