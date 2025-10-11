'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered successfully', {
            scope: registration.scope,
          })
        })
        .catch((error) => {
          logger.error(error, 'Service Worker registration failed')
        })
    }
  }, [])

  return null
}
