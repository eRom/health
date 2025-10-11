import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'romain.ecarnot@gmail.com' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true
    }
  })
  
  if (user) {
    logger.info('User found', { user })
  } else {
    logger.info('User not found')
  }
}

main()
  .catch((e) => {
    logger.error(e, 'Error checking user')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
