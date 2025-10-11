import { headers } from 'next/headers'
import { auth } from './auth'
import { prisma } from './prisma'

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  
  if (user?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return session
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return user?.role === 'ADMIN'
}

export async function requireHealthcareProvider() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "HEALTHCARE_PROVIDER") {
    throw new Error("Forbidden: Healthcare provider access required");
  }

  return session;
}

export async function requireHealthcareProviderOrAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "HEALTHCARE_PROVIDER" && user?.role !== "ADMIN") {
    throw new Error("Forbidden: Healthcare provider or admin access required");
  }

  return session;
}

export async function isHealthcareProvider(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "HEALTHCARE_PROVIDER";
}

