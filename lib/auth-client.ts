"use client"

import { createAuthClient } from "better-auth/react"

const resolveBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
  fetchOptions: {
    credentials: "include", // Important for cookies with Cloudflare
  },
})
