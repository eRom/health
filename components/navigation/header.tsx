'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/auth/user-nav'
import { LanguageSwitcher } from '@/components/navigation/language-switcher'
import { Logo } from '@/components/ui/logo'
import { authClient } from '@/lib/auth-client'

export function Header() {
  const t = useTranslations()
  const { data: session } = authClient.useSession()

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">{t('app.title')}</span>
        </Link>

        <nav className="flex items-center gap-6">
          {session?.user && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t('navigation.dashboard')}
              </Link>
              <Link
                href="/neuro"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t('navigation.neuro')}
              </Link>
              <Link
                href="/ortho"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t('navigation.ortho')}
              </Link>
            </>
          )}

          <LanguageSwitcher />

          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/login">{t('auth.signIn')}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
