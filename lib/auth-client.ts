"use client"

import { createAuthClient } from "better-auth/react"

// Use environment variables for consistent SSR/client rendering
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // For development, use localhost with the correct port
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001"; // Match the port from terminal output
  }

  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include", // Important for cookies with Cloudflare
  },
});
