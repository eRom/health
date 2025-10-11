#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function promoteToHealthcareProvider() {
  try {
    const email = 'roecarnot@gmail.com'
    
    console.log(`🔍 Recherche du compte ${email}...`)
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    if (!user) {
      console.error(`❌ Utilisateur ${email} non trouvé`)
      return
    }
    
    console.log(`✅ Utilisateur trouvé:`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    })
    
    if (user.role === 'HEALTHCARE_PROVIDER') {
      console.log(`ℹ️  L'utilisateur ${email} est déjà soignant`)
      return
    }
    
    console.log(`🔄 Promotion de ${email} au rôle HEALTHCARE_PROVIDER...`)
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'HEALTHCARE_PROVIDER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log(`✅ Utilisateur promu avec succès:`, updatedUser)
    console.log(`🎉 ${email} peut maintenant accéder au module soignant !`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la promotion:', error)
  } finally {
    await prisma.$disconnect()
  }
}

promoteToHealthcareProvider()
