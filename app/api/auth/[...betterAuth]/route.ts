import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export const runtime = 'nodejs'

// Wrap handlers to add CORS headers for service worker requests
async function handleWithCors(
  request: NextRequest,
  handler: typeof auth.handler
) {
  const response = await handler(request)

  // Add CORS headers for service worker and same-origin requests
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://healthincloud.app',
    'https://www.healthincloud.app',
  ].filter(Boolean)

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export async function GET(request: NextRequest) {
  return handleWithCors(request, auth.handler)
}

export async function POST(request: NextRequest) {
  return handleWithCors(request, auth.handler)
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://healthincloud.app',
    'https://www.healthincloud.app',
  ].filter(Boolean)

  const headers = new Headers()
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return new Response(null, { status: 204, headers })
}
