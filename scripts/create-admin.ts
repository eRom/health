import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

async function main() {
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
}

main()
  .catch((e) => {
    logger.error(e, 'Failed to create admin')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
