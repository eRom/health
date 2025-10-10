import { prisma } from '../lib/prisma'

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
  
  console.log('Admin created/updated:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

