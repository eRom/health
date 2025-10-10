import { prisma } from '../lib/prisma'

async function main() {
  const adminEmail = 'romain.ecarnot@gmail.com'
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Romain Ecarnot',
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
