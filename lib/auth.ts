import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"

// Determine base URL based on environment
const getBaseURL = () => {
  // 1. Use explicit NEXT_PUBLIC_APP_URL if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 2. For Vercel deployments (preview & production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 3. Local development fallback
  return "http://localhost:3000"
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: getBaseURL(),
  trustedOrigins: [
    getBaseURL(),
    "https://dev.healthincloud.app",
    "https://healthincloud.app",
  ],
  advanced: {
    cookieOptions: {
      // Configure cookies to work with Cloudflare proxy
      sameSite: "lax",
      secure: true,
      httpOnly: true,
      path: "/",
      // Add domain for Cloudflare
      ...(process.env.NODE_ENV === "production" && {
        domain: ".healthincloud.app",
      }),
    },
  },
})
