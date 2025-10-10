'use client'

import { deleteUser } from '@/app/actions/admin/delete-user'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Shield, Trash2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type User = {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
  emailVerified: boolean
  healthDataConsentGrantedAt: Date | null
  _count: {
    exerciseAttempts: number
    sessions: number
  }
  consentHistory: Array<{
    consentType: string
    granted: boolean
    grantedAt: Date
  }>
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      setDeletingUserId(userId)
      await deleteUser(userId)
      toast.success(`Utilisateur ${userEmail} supprimé`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingUserId(null)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getConsentStatus = (user: User) => {
    if (user.healthDataConsentGrantedAt) {
      return {
        status: 'granted',
        date: formatDate(user.healthDataConsentGrantedAt),
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      }
    }
    
    const latestConsent = user.consentHistory[0]
    if (latestConsent) {
      return {
        status: latestConsent.granted ? 'granted' : 'not-granted',
        date: formatDate(latestConsent.grantedAt),
        color: latestConsent.granted 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }
    }
    
    return {
      status: 'not-granted',
      date: null,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead>Email vérifié</TableHead>
            <TableHead>Consentement RGPD</TableHead>
            <TableHead>Exercices</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const consent = getConsentStatus(user)
            
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? (
                      <>
                        <Shield className="mr-1 h-3 w-3" />
                        Administrateur
                      </>
                    ) : (
                      <>
                        <User className="mr-1 h-3 w-3" />
                        Utilisateur
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                    {user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={consent.color}>
                    {consent.status === 'granted' ? 'Accordé' : 'Non accordé'}
                    {consent.date && ` le ${consent.date}`}
                  </Badge>
                </TableCell>
                <TableCell>{user._count.exerciseAttempts}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingUserId === user.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer {user.email} ? 
                          Toutes ses données seront définitivement supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
