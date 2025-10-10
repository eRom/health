import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"

// Determine base URL based on environment
const getBaseURL = () => {
  // 1. Use explicit NEXT_PUBLIC_APP_URL if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 2. Allow overriding via AUTH_BASE_URL for server-only use
  if (process.env.AUTH_BASE_URL) {
    return process.env.AUTH_BASE_URL
  }

  // 3. For Vercel deployments (preview & production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 4. Local development fallback (respect HOST/PORT if provided)
  const host = process.env.HOST ?? "localhost"
  const port = process.env.PORT ?? "3000"

  return `http://${host}:${port}`
}

const baseURL = getBaseURL()

const resolvedHostname = (() => {
  try {
    return new URL(baseURL).hostname
  } catch {
    return undefined
  }
})()

const isHealthInCloudDomain =
  typeof resolvedHostname === "string" &&
  resolvedHostname.endsWith("healthincloud.app")

const resolvedPort = (() => {
  try {
    const url = new URL(baseURL)
    if (url.port) {
      return url.port
    }
    return url.protocol === "https:" ? "443" : "80"
  } catch {
    return undefined
  }
})()

const localTrustedOrigins: string[] = []

if (resolvedHostname && ["localhost", "127.0.0.1", "0.0.0.0"].includes(resolvedHostname)) {
  const candidatePorts = new Set<string>([
    resolvedPort ?? "",
    process.env.PORT ?? "",
    "3000",
    "3001",
  ])

  for (const port of candidatePorts) {
    const suffix = port ? `:${port}` : ""
    localTrustedOrigins.push(`http://localhost${suffix}`)
    localTrustedOrigins.push(`http://127.0.0.1${suffix}`)
  }
}

const trustedOrigins = Array.from(
  new Set(
    [
      baseURL,
      ...localTrustedOrigins,
      "https://healthincloud.app",
      "https://www.healthincloud.app",
      "https://app.healthincloud.app",
      "https://dev.healthincloud.app",
    ].filter(Boolean)
  )
)

// ✅ CORRECTIF : Configuration améliorée pour les cookies en preview/production
const advancedConfig = isHealthInCloudDomain
  ? {
      crossSubDomainCookies: {
        enabled: true,
        domain: ".healthincloud.app", // Leading dot for all subdomains
      },
      // Configuration explicite des cookies pour Vercel
      cookies: {
        sessionToken: {
          name: "better-auth.session_token",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        },
      },
    }
  : undefined;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${baseURL}/api/auth/callback/google`,
    },
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],
  },
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({
      user,
      token,
    }: {
      user: { email: string; locale?: string | null };
      token: string;
    }) => {
      const { sendVerificationEmail } = await import("./email/send");
      const userLocale = (user as { locale?: string | null })?.locale ?? "fr";
      await sendVerificationEmail(user.email, token, userLocale);
    },
  },
  forgetPassword: {
    enabled: true,
    sendResetPassword: async ({
      user,
      token,
    }: {
      user: { email: string; locale?: string | null };
      token: string;
    }) => {
      const { sendPasswordResetEmail } = await import("./email/send");
      const userLocale = (user as { locale?: string | null })?.locale ?? "fr";
      await sendPasswordResetEmail(user.email, token, userLocale);
    },
  },
  baseURL,
  trustedOrigins,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    cookieName: "better-auth.session_token",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  ...(advancedConfig ? { advanced: advancedConfig } : {}),
});
