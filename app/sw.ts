import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

// Filter out API routes and other non-cacheable URLs from precache manifest
const precacheManifest = (self.__SW_MANIFEST || []).filter((entry) => {
  const url = typeof entry === 'string' ? entry : entry.url

  // Exclude API routes - they shouldn't be precached
  if (url.includes('/api/')) return false

  // Exclude robots.txt route
  if (url.includes('robots.txt')) return false

  // Only include actual static assets
  return true
})

const serwist = new Serwist({
  precacheEntries: precacheManifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  },
  fallbacks: {
    entries: [
      {
        url: "/fr/offline",
        matcher({ request }) {
          return (
            request.destination === "document" && request.url.includes("/fr/")
          );
        },
      },
      {
        url: "/en/offline",
        matcher({ request }) {
          return (
            request.destination === "document" && request.url.includes("/en/")
          );
        },
      },
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners()
