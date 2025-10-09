import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth";
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
      console.log(
        "[MIDDLEWARE DEBUG] Session found, checking email verification"
      );

      // Check if user's email is verified for exercise routes
      if (
        pathname.includes("/exercises") ||
        pathname.includes("/neuro") ||
        pathname.includes("/ortho")
      ) {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (session?.user && !session.user.emailVerified) {
            console.log(
              "[MIDDLEWARE DEBUG] Email not verified, redirecting to dashboard with banner"
            );
            const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
            return NextResponse.redirect(dashboardUrl);
          }
        } catch (error) {
          console.error(
            "[MIDDLEWARE DEBUG] Error checking email verification:",
            error
          );
          // Continue to allow access if check fails
        }
      }
    }
  }

  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*"],
};
