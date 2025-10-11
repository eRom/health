import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

async function main() {
  // Vérifier le rôle de l'utilisateur connecté
  const userId = 'TKq97YOuOdWIPlHxGX9RVjv9Va3q2xEe' // ID de Marie Dupont
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true
    }
  })
  
  logger.info('User found', { user })
  logger.info('Is admin?', { isAdmin: user?.role === 'ADMIN' })
}

main()
  .catch((e) => {
    logger.error(e, 'Failed to debug user role')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
