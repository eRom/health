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

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // ✅ CORRECTIF : Configuration pour utiliser l'API moderne de stockage
  cacheId: "healthincloud-v1",
  cleanupOutdatedCaches: true,
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
