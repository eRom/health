'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === locale)

  function handleLanguageChange(newLocale: 'fr' | 'en') {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label={`Langue actuelle : ${currentLanguage?.name}. Cliquer pour changer de langue`}
        >
          <span aria-hidden="true">{currentLanguage?.flag}</span>
          <span className="hidden sm:inline">{currentLanguage?.code.toUpperCase()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir la langue / Choose language</DialogTitle>
          <DialogDescription>
            Sélectionnez votre langue préférée / Select your preferred language
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={locale === lang.code ? 'default' : 'outline'}
              className="justify-start gap-3"
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span>{lang.name}</span>
              {locale === lang.code && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
