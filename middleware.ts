import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  debugLocale,
  extractLocaleFromPath,
  isAdminRoute,
  isProtectedRoute,
} from "./lib/locale-utils";
import { logger } from "./lib/logger";

const intlMiddleware = createMiddleware(routing);

type SessionResponse = {
  session?: {
    user?: {
      id: string;
      emailVerified?: boolean | null;
      healthDataConsentGrantedAt?: string | null;
    };
  } | null;
};

async function fetchSession(request: NextRequest) {
  try {
    const sessionUrl = new URL("/api/internal/session", request.url);
    const cookieHeader = request.headers.get("cookie") ?? "";

    const response = await fetch(sessionUrl, {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      logger.warn("[MIDDLEWARE] Session fetch failed", {
        status: response.status,
      });
      return null;
    }

    const data = (await response.json()) as SessionResponse;
    return data.session ?? null;
  } catch (error) {
    logger.error(error, "[MIDDLEWARE] Error fetching session");
    return null;
  }
}

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

    logger.debug("[MIDDLEWARE] Checking session cookies", {
      pathname,
      locale,
      sessionToken: !!sessionToken,
      secureSessionLower: !!secureSessionLower,
      secureSessionUpper: !!secureSessionUpper,
      allCookies: request.cookies.getAll().map((c) => c.name),
    });

    if (!sessionToken && !secureSessionLower && !secureSessionUpper) {
      logger.debug("[MIDDLEWARE] No session found, redirecting to login", {
        pathname,
        locale,
      });

      // ✅ CORRECTIF : Redirection avec locale préservée et paramètres de requête
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);

      // Préserver les paramètres de requête pour redirection après login
      if (request.nextUrl.search) {
        loginUrl.search = request.nextUrl.search;
      }

      debugLocale("REDIRECT_TO_LOGIN", locale, loginUrl.pathname);
      return NextResponse.redirect(loginUrl);
    } else {
      logger.debug("[MIDDLEWARE] Session found, checking permissions", {
        pathname,
        locale,
      });

      // Check admin routes - simplified check without Prisma
      if (isAdminRoute(pathname)) {
        try {
          const session = await fetchSession(request);

          if (!session?.user) {
            logger.debug(
              "[MIDDLEWARE] No session for admin route, redirecting to login",
              { pathname, locale }
            );
            const loginUrl = new URL(`/${locale}/auth/login`, request.url);
            return NextResponse.redirect(loginUrl);
          }

        } catch (error) {
          logger.error(
            error,
            "[MIDDLEWARE] Error checking admin permissions"
          );
          // Redirect to dashboard on error
          const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }

      // Check if user's email is verified for exercise routes
      if (
        pathname.includes("/exercises") ||
        pathname.includes("/neuro") ||
        pathname.includes("/ortho")
      ) {
        try {
          const session = await fetchSession(request);

          if (session?.user && !session.user.emailVerified) {
            logger.info(
              "[MIDDLEWARE] Email not verified, redirecting to dashboard",
              { userId: session.user.id }
            );
            const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
            return NextResponse.redirect(dashboardUrl);
          }
        } catch (error) {
          logger.error(
            error,
            "[MIDDLEWARE] Error checking email verification"
          );
          // Continue to allow access if check fails
        }
      }

      // Check health data consent for protected routes (except consent page itself)
      if (!pathname.includes("/consent")) {
        try {
          const session = await fetchSession(request);

          if (session?.user) {
            // Check consent via API route (secure but lightweight)
            const consentCheckUrl = new URL(
              "/api/internal/consent-check",
              request.url
            );
            const cookieHeader = request.headers.get("cookie") ?? "";

            const consentResponse = await fetch(consentCheckUrl, {
              headers: {
                cookie: cookieHeader,
              },
              cache: "no-store",
            });

            if (consentResponse.ok) {
              const consentData = await consentResponse.json();

              if (!consentData.hasConsent) {
                logger.info(
                  "[MIDDLEWARE] Consent not granted, redirecting",
                  { userId: session.user.id }
                );
                const consentUrl = new URL(`/${locale}/consent`, request.url);
                return NextResponse.redirect(consentUrl);
              }
            }
          }
        } catch (error) {
          logger.error(error, "[MIDDLEWARE] Error checking session");
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
