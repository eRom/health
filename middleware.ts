import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { handleGoogleOAuthLock } from "./lib/google-oauth-lock";
import {
  debugLocale,
  extractLocaleFromPath,
  isAdminRoute,
  isHealthcareRoute,
  isProtectedRoute,
} from "./lib/locale-utils";
import { middlewareLogger as logger } from "./lib/middleware-logger";

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

  // Handle Google OAuth registration lock
  // NOTE: Disabled to reduce middleware bundle size
  // OAuth registration lock is now handled in Better Auth config (lib/auth.ts)
  const oauthLockResponse = await handleGoogleOAuthLock();
  if (oauthLockResponse) {
    return oauthLockResponse;
  }

  // ✅ CORRECTIF : Gérer les requêtes OPTIONS pour éviter les erreurs 400
  if (request.method === "OPTIONS") {
    // Pour les requêtes OPTIONS vers les locales, retourner une réponse OK
    if (pathname === "/fr" || pathname === "/en") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Pour les autres requêtes OPTIONS, laisser passer
    return new NextResponse(null, { status: 200 });
  }

  // Handle badge URLs without locale - redirect to French by default
  if (
    pathname.startsWith("/badges/") &&
    !pathname.startsWith("/fr/badges/") &&
    !pathname.startsWith("/en/badges/")
  ) {
    const badgeId = pathname.split("/badges/")[1];
    if (badgeId) {
      const redirectUrl = new URL(`/fr/badges/${badgeId}`, request.url);
      // Preserve query parameters
      if (request.nextUrl.search) {
        redirectUrl.search = request.nextUrl.search;
      }
      logger.debug("[MIDDLEWARE] Redirecting badge URL to French locale", {
        originalPath: pathname,
        redirectPath: redirectUrl.pathname,
      });
      return NextResponse.redirect(redirectUrl);
    }
  }

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
          logger.error(error, "[MIDDLEWARE] Error checking admin permissions");
          // Redirect to dashboard on error
          const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }

      // Check healthcare routes - simplified check without Prisma
      if (isHealthcareRoute(pathname)) {
        try {
          const session = await fetchSession(request);

          if (!session?.user) {
            logger.debug(
              "[MIDDLEWARE] No session for healthcare route, redirecting to login",
              { pathname, locale }
            );
            const loginUrl = new URL(`/${locale}/auth/login`, request.url);
            return NextResponse.redirect(loginUrl);
          }
        } catch (error) {
          logger.error(
            error,
            "[MIDDLEWARE] Error checking healthcare permissions"
          );
          // Redirect to dashboard on error
          const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }

      // Redirect healthcare providers away from dashboard to their dedicated interface
      // Note: This check is disabled in middleware as we don't have access to user role
      // The redirect will be handled in the dashboard page component instead

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
          logger.error(error, "[MIDDLEWARE] Error checking email verification");
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
                logger.info("[MIDDLEWARE] Consent not granted, redirecting", {
                  userId: session.user.id,
                });
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

      // NOTE: Subscription check moved to page-level protection
      // The middleware cannot use Prisma on Edge Runtime
      // Each protected page will check subscription using Server Components
    }
  }

  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*", "/badges/:path*"],
};
