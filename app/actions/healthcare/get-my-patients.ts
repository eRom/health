'use server'

import { requireHealthcareProviderOrAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export async function getMyPatients() {
  try {
    const session = await requireHealthcareProviderOrAdmin()
    
    const patients = await prisma.patientProviderAssociation.findMany({
      where: {
        providerId: session.user.id,
        status: { in: ['PENDING', 'ACCEPTED'] }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            emailVerified: true,
            _count: {
              select: {
                exerciseAttempts: true
              }
            }
          }
        },
        messages: {
          where: {
            read: false,
            senderId: { not: session.user.id } // Messages non lus du patient
          },
          select: {
            id: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    // Calculer les statistiques pour chaque patient
    const patientsWithStats = await Promise.all(
      patients.map(async (association) => {
        const exerciseAttempts = await prisma.exerciseAttempt.findMany({
          where: {
            userId: association.patient.id
          },
          select: {
            score: true,
            completedAt: true,
            duration: true
          },
          orderBy: {
            completedAt: 'desc'
          }
        })
        
        const totalAttempts = exerciseAttempts.length
        const averageScore = totalAttempts > 0 
          ? exerciseAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts
          : 0
        
        const lastActivity = exerciseAttempts[0]?.completedAt || association.patient.createdAt
        
        return {
          id: association.id,
          patientId: association.patient.id,
          patientName: association.patient.name,
          patientEmail: association.patient.email,
          status: association.status,
          createdAt: association.createdAt,
          acceptedAt: association.acceptedAt,
          invitationSentAt: association.invitationSentAt,
          stats: {
            totalAttempts,
            averageScore: Math.round(averageScore * 100) / 100,
            lastActivity,
            unreadMessages: association.messages.length,
            totalMessages: association._count.messages
          }
        }
      })
    )
    
    logger.info('[GET_MY_PATIENTS] Retrieved patients', {
      providerId: session.user.id,
      patientCount: patientsWithStats.length
    })
    
    return patientsWithStats
  } catch (error) {
    logger.error(error, '[GET_MY_PATIENTS] Error retrieving patients')
    throw error
  }
}
