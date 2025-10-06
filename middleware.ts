import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

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
    // Check for Better Auth session cookies
    // Better Auth can use different cookie names depending on configuration
    const sessionToken = request.cookies.get('better-auth.session_token')
    const sessionCookie = request.cookies.get('better_auth.session_token')
    const authSession = request.cookies.get('authjs.session-token')

    // Log cookies for debugging (remove in production)
    console.log('Checking auth cookies:', {
      hasSessionToken: !!sessionToken,
      hasSessionCookie: !!sessionCookie,
      hasAuthSession: !!authSession,
      allCookies: request.cookies.getAll().map(c => c.name)
    })

    if (!sessionToken && !sessionCookie && !authSession) {
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
