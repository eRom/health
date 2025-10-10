'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

type SessionPayload = Awaited<ReturnType<typeof auth.api.getSession>>

export async function checkIsAdmin(
  sessionOverride?: SessionPayload | null
): Promise<boolean> {
  try {
    const session =
      sessionOverride ??
      (await auth.api.getSession({ headers: await headers() }))

    if (!session?.user?.id) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    return user?.role === 'ADMIN'
  } catch {
    return false
  }
}
