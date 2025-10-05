import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EditNameForm } from '@/components/profile/edit-name-form'
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }

  const { user } = session
  const createdAt = new Date(session.createdAt)

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Mon Profil</h1>

      <div className="grid gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Gérez vos informations de compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EditNameForm currentName={user.name} />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Membre depuis</p>
              <p className="text-lg">
                {createdAt.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Paramètres de sécurité de votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Les paramètres de sécurité avancés (changement de mot de passe, sessions actives)
                seront disponibles prochainement.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Les préférences de langue, notifications et thème seront disponibles prochainement.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Zone de danger */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles concernant votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>⚠️ Attention :</strong> La suppression de votre compte est définitive et
                irréversible. Toutes vos données personnelles et votre historique d&apos;exercices
                seront supprimés immédiatement.
              </AlertDescription>
            </Alert>
            <div>
              <DeleteAccountDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
