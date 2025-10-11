'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import { debugLocale } from '@/lib/locale-utils'
import { logger } from '@/lib/logger'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

/**
 * Composant de débogage pour la locale (à utiliser uniquement en développement)
 * Affiche les informations de locale et permet de tester les redirections
 */
export function LocaleDebugger() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    debugLocale("COMPONENT_RENDER", locale, pathname);
    // Set URL only on client side to avoid hydration mismatch
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [locale, pathname])

  // Ne s'affiche qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const testRedirects = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'Neuro', path: '/neuro' },
    { label: 'Ortho', path: '/ortho' },
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-mono shadow-lg"
      >
        Locale Debug {isVisible ? "▼" : "▲"}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border rounded-lg shadow-lg p-4 min-w-64">
          <div className="space-y-2 text-sm font-mono">
            <div>
              <strong>Locale:</strong> {locale}
            </div>
            <div>
              <strong>Pathname:</strong> {pathname}
            </div>
            <div>
              <strong>Full URL:</strong> {currentUrl || "Loading..."}
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="font-semibold mb-2">Test Redirects:</div>
              {testRedirects.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => router.push(path)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                >
                  {label} → {path}
                </button>
              ))}
            </div>

            <div className="border-t pt-2 mt-2">
              <button
                onClick={() => {
                  logger.debug("Current locale state", {
                    locale,
                    pathname,
                    url: currentUrl,
                    cookies:
                      typeof document !== "undefined" ? document.cookie : "",
                    timestamp: new Date().toISOString(),
                  });
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Log State to Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
