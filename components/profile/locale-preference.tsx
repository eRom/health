'use client'

import { useState } from 'react'
import { useRouter, usePathname } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { updatePreferences } from '@/app/actions/update-preferences'
import { toast } from 'sonner'

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const

export function LocalePreference({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLanguageChange(newLocale: 'fr' | 'en') {
    if (newLocale === currentLocale) return

    setIsLoading(true)

    // Update preference in database
    const result = await updatePreferences({ locale: newLocale })

    if (result.success) {
      toast.success('Langue mise à jour avec succès')
      // Change route locale
      router.replace(pathname, { locale: newLocale })
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour')
    }

    setIsLoading(false)
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-muted-foreground">Langue de l&apos;interface</p>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLocale === lang.code ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isLoading || currentLocale === lang.code}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLocale === lang.code && <span className="text-xs">✓</span>}
          </Button>
        ))}
      </div>
    </div>
  )
}
