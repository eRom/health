/**
 * Google OAuth Registration Lock Middleware
 *
 * NOTE: This function is DISABLED in Edge middleware to avoid bundle size issues.
 * The registration lock for Google OAuth is now handled in the Better Auth config
 * via the onSuccess callback in lib/auth.ts
 *
 * This file is kept for reference but is no longer used in middleware.
 */

export async function handleGoogleOAuthLock() {
  // This function is now a no-op
  // Registration lock is handled in Better Auth config instead
  return null;
}
