import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  debugLocale,
  extractLocaleFromPath,
  isProtectedRoute,
} from "./lib/locale-utils";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ CORRECTIF : Utilisation des utilitaires pour une gestion cohérente
  const locale = extractLocaleFromPath(pathname);
  debugLocale("MIDDLEWARE", locale, pathname);

  if (isProtectedRoute(pathname)) {
    // Check for Better Auth session cookies
    // Better Auth uses __secure- or __Secure- prefixes in production
    const sessionToken = request.cookies.get("better-auth.session_token");
    const secureSessionLower = request.cookies.get(
      "__secure-better-auth.session_token"
    );
    const secureSessionUpper = request.cookies.get(
      "__Secure-better-auth.session_token"
    );

    console.log("[MIDDLEWARE DEBUG] Checking session cookies:", {
      pathname,
      locale,
      sessionToken: !!sessionToken,
      secureSessionLower: !!secureSessionLower,
      secureSessionUpper: !!secureSessionUpper,
      allCookies: request.cookies.getAll().map(c => c.name)
    });

    if (!sessionToken && !secureSessionLower && !secureSessionUpper) {
      console.log("[MIDDLEWARE DEBUG] No session found, redirecting to login");
      
      // ✅ CORRECTIF : Redirection avec locale préservée et paramètres de requête
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);

      // Préserver les paramètres de requête pour redirection après login
      if (request.nextUrl.search) {
        loginUrl.search = request.nextUrl.search;
      }

      debugLocale("REDIRECT_TO_LOGIN", locale, loginUrl.pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      console.log("[MIDDLEWARE DEBUG] Session found, allowing access");
    }
  }

  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*"],
};
