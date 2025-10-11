import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    return NextResponse.json({ session })
  } catch (error) {
    logger.error(error, "[API][SESSION] Failed to fetch session")
    return NextResponse.json({ session: null }, { status: 500 })
  }
}
