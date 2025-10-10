'use server'

import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteUser(userId: string) {
  const session = await requireAdmin()
  
  // Empêcher l'auto-suppression
  if (session.user.id === userId) {
    throw new Error('Cannot delete your own account')
  }
  
  // Suppression en cascade (grâce à onDelete: Cascade dans le schéma)
  await prisma.user.delete({
    where: { id: userId }
  })
  
  revalidatePath('/admin/users')
  
  return { success: true }
}

