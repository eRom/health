'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { deleteAccount } from '@/app/actions/delete-account'

export function DeleteAccountDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const canDelete = confirmText === 'SUPPRIMER'

  async function handleDelete() {
    if (!canDelete) return

    setIsDeleting(true)
    setError('')

    try {
      const result = await deleteAccount()

      if (result.success) {
        // Sign out the user
        await authClient.signOut()
        // Redirect to homepage
        router.push('/')
      } else {
        setError(result.error || 'Une erreur est survenue')
        setIsDeleting(false)
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la suppression')
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer mon compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="font-semibold text-destructive">
              ⚠️ Cette action est irréversible et ne peut pas être annulée.
            </p>
            <p>
              Toutes vos données personnelles et votre historique d&apos;exercices seront
              supprimés immédiatement et définitivement.
            </p>
            <p>
              Pour confirmer, veuillez taper{' '}
              <span className="font-mono font-bold">SUPPRIMER</span> dans le champ ci-dessous :
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              disabled={isDeleting}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Suppression en cours...' : 'Supprimer définitivement'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
