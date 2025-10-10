import { prisma } from './prisma'

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    return user?.role === 'ADMIN'
  } catch (error) {
    console.error('[ISADMIN DEBUG] Error:', error)
    return false
  }
}
