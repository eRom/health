'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

export function UserNav({ user }: { user: { name: string; email: string } }) {
  const t = useTranslations()
  const router = useRouter()
  const [isSignOutOpen, setIsSignOutOpen] = useState(false)

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">
        {user.name}
      </span>

      <Dialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {t('auth.signOut')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déconnexion</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignOutOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSignOut}>
              {t('auth.signOut')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
