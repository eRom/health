import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  debugLocale,
  extractLocaleFromPath,
  isAdminRoute,
  isProtectedRoute,
} from "./lib/locale-utils";

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
      console.error(
        "[MIDDLEWARE DEBUG] Session fetch failed:",
        response.status
      );
      return null;
    }

    const data = (await response.json()) as SessionResponse;
    return data.session ?? null;
  } catch (error) {
    console.error("[MIDDLEWARE DEBUG] Error fetching session:", error);
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

    console.log("[MIDDLEWARE DEBUG] Checking session cookies:", {
      pathname,
      locale,
      sessionToken: !!sessionToken,
      secureSessionLower: !!secureSessionLower,
      secureSessionUpper: !!secureSessionUpper,
      allCookies: request.cookies.getAll().map((c) => c.name),
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
      console.log("[MIDDLEWARE DEBUG] Session found, checking permissions");

      // Check admin routes - simplified check without Prisma
      if (isAdminRoute(pathname)) {
        try {
          const session = await fetchSession(request);

          if (!session?.user) {
            console.log(
              "[MIDDLEWARE DEBUG] No session for admin route, redirecting to login"
            );
            const loginUrl = new URL(`/${locale}/auth/login`, request.url);
            return NextResponse.redirect(loginUrl);
          }

          // For now, allow access and let the layout handle the admin check
          // This avoids Prisma Client issues in Edge Runtime
          console.log(
            "[MIDDLEWARE DEBUG] Session found for admin route, allowing access"
          );
        } catch (error) {
          console.error(
            "[MIDDLEWARE DEBUG] Error checking admin permissions:",
            error
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
                console.log(
                  "[MIDDLEWARE DEBUG] Health data consent not granted, redirecting to consent page"
                );
                const consentUrl = new URL(`/${locale}/consent`, request.url);
                return NextResponse.redirect(consentUrl);
              }
            }
          }
        } catch (error) {
          console.error("[MIDDLEWARE DEBUG] Error checking session:", error);
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
