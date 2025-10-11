import { InvitePatientForm } from '@/components/healthcare/invite-patient-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Clock, Mail, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "healthcare" });

  return {
    title: t("invitation.title"),
    description: t("invitation.title"),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `https://healthincloud.app/${locale}/healthcare/invite`,
      languages: {
        fr: "https://healthincloud.app/fr/healthcare/invite",
        en: "https://healthincloud.app/en/healthcare/invite",
      },
    },
  };
}

export default async function InvitePatientPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/healthcare">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Inviter un patient</h1>
          <p className="text-muted-foreground">
            Associez un nouveau patient à votre suivi
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire principal */}
        <div className="lg:col-span-2">
          <InvitePatientForm />
        </div>

        {/* Informations et aide */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Comment ça marche ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                    1
                  </div>
                  <span className="text-sm font-medium">Invitation par email</span>
                </div>
                <p className="text-xs text-muted-foreground ml-8">
                  Le patient reçoit un email avec votre invitation personnalisée
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                    2
                  </div>
                  <span className="text-sm font-medium">Acceptation</span>
                </div>
                <p className="text-xs text-muted-foreground ml-8">
                  Le patient clique sur le lien pour accepter votre invitation
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                    3
                  </div>
                  <span className="text-sm font-medium">Suivi activé</span>
                </div>
                <p className="text-xs text-muted-foreground ml-8">
                  Vous pouvez suivre sa progression et échanger des messages
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Que peut faire le patient ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Suivre sa progression</p>
                  <p className="text-xs text-muted-foreground">
                    Accès à ses statistiques et graphiques
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Échanger des messages</p>
                  <p className="text-xs text-muted-foreground">
                    Communication directe avec vous
                  </p>
                </div>
              </div>

             
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informations importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Invitation valide 7 jours
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Le patient doit accepter dans les 7 jours suivant l&apos;envoi
                </p>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Données sécurisées
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Toutes les données sont chiffrées et conformes RGPD
                </p>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Un seul soignant par patient
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Un patient ne peut être associé qu&apos;à un seul soignant à la fois
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
