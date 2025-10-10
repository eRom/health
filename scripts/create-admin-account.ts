import { prisma } from '../lib/prisma'

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
  
  console.log('Admin created/updated:', admin.email)
  console.log('You can now sign up with this email and it will be promoted to ADMIN')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

