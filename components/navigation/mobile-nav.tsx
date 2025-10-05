'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Menu, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface MobileNavProps {
  isAuthenticated: boolean
  userName?: string
}

export function MobileNav({ isAuthenticated, userName }: MobileNavProps) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)

  const closeSheet = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>{t('app.title')}</SheetTitle>
        </SheetHeader>

        <nav className="mt-8 flex flex-col gap-4">
          {isAuthenticated ? (
            <>
              {userName && (
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Connecté en tant que</p>
                  <p className="font-medium">{userName}</p>
                </div>
              )}

              <Link
                href="/dashboard"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>{t('navigation.dashboard')}</span>
              </Link>

              <Link
                href="/neuro"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>{t('navigation.neuro')}</span>
              </Link>

              <Link
                href="/ortho"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>{t('navigation.ortho')}</span>
              </Link>

              <Link
                href="/profile"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>Profil</span>
              </Link>

              <div className="my-4 border-t"></div>

              <Link
                href="/"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>Accueil</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>Accueil</span>
              </Link>

              <Link
                href="/about"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>À propos</span>
              </Link>

              <div className="my-4 border-t"></div>

              <Link
                href="/auth/login"
                onClick={closeSheet}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span>{t('auth.signIn')}</span>
              </Link>

              <Link
                href="/auth/signup"
                onClick={closeSheet}
              >
                <Button className="w-full">
                  {t('auth.signUp')}
                </Button>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
