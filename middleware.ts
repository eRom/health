import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { auth } from './lib/auth'

const intlMiddleware = createMiddleware(routing)

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/neuro', '/ortho', '/profile']

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected (remove locale prefix for checking)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  )

  if (isProtectedRoute) {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      // Redirect to login, preserving locale
      const locale = pathname.split('/')[1] || routing.defaultLocale
      return NextResponse.redirect(
        new URL(`/${locale}/auth/login`, request.url)
      )
    }
  }

  // Apply i18n middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(fr|en)/:path*'],
}
