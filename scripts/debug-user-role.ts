import { prisma } from '../lib/prisma'

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
  
  console.log('User found:', user)
  console.log('Is admin?', user?.role === 'ADMIN')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
