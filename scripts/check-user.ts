import { prisma } from '../lib/prisma'

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
    console.log('User found:', user)
  } else {
    console.log('User not found')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

