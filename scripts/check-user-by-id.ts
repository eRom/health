import { prisma } from '../lib/prisma'

const userId = 'mZfvePKCd1NGIF4lnJuE6g3dFJgPny15'

async function check() {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  })

  console.log('User:', user)
}

check().then(() => prisma.$disconnect())
