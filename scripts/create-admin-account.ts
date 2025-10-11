import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

async function main() {
  // Créer un compte admin avec un mot de passe connu
  const adminEmail = 'admin@healthincloud.app'
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Administrator',
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  
  logger.info('Admin created/updated', { email: admin.email })
  logger.info('You can now sign up with this email and it will be promoted to ADMIN')
}

main()
  .catch((e) => {
    logger.error(e, 'Failed to create admin account')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
