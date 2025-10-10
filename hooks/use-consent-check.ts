'use client'

import { useRouter } from '@/i18n/routing'
import { useEffect } from 'react'

export function useConsentCheck() {
  const router = useRouter()

  useEffect(() => {
    const checkConsent = async () => {
      try {
        // Fetch session to check consent status
        const response = await fetch('/api/internal/session', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          const session = data.session

          if (session?.user && !session.user.healthDataConsentGrantedAt) {
            // User is logged in but hasn't granted consent
            // Redirect to consent page
            router.push('/consent')
          }
        }
      } catch (error) {
        console.error('Error checking consent:', error)
        // Don't redirect on error to avoid infinite loops
      }
    }

    // Only check on client side and not on consent page itself
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/consent')) {
      checkConsent()
    }
  }, [router])
}
