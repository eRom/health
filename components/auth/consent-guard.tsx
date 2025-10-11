'use client'

import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

interface ConsentGuardProps {
  children: React.ReactNode
}

export function ConsentGuard({ children }: ConsentGuardProps) {
  const router = useRouter()
  const t = useTranslations()
  const [isChecking, setIsChecking] = useState(true)
  const [needsConsent, setNeedsConsent] = useState(false)

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/internal/session', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          const session = data.session

          if (session?.user && !session.user.healthDataConsentGrantedAt) {
            setNeedsConsent(true)
            router.push('/consent')
          }
        }
      } catch (error) {
        logger.error(error, 'Error checking consent in guard')
      } finally {
        setIsChecking(false)
      }
    }

    checkConsent()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (needsConsent) {
    return null // Will redirect to consent page
  }

  return <>{children}</>
}
