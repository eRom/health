import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ hasConsent: false, error: "Not authenticated" })
    }

    // Check consent directly from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { healthDataConsentGrantedAt: true },
    })

    const hasConsent = !!user?.healthDataConsentGrantedAt

    return NextResponse.json({ 
      hasConsent,
      userId: session.user.id 
    })
  } catch (error) {
    logger.error(error, "Error checking consent")
    return NextResponse.json(
      { hasConsent: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
