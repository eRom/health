import { getMyPatients } from '@/app/actions/healthcare/get-my-patients'
import { PatientStatsCard } from '@/components/healthcare/patient-stats-card'
import { PatientsTable } from '@/components/healthcare/patients-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import {
    Activity,
    Clock,
    MessageSquare,
    Plus,
    TrendingUp,
    Users
} from 'lucide-react'
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
    title: t("title"),
    description: t("title"),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `https://healthincloud.app/${locale}/healthcare`,
      languages: {
        fr: "https://healthincloud.app/fr/healthcare",
        en: "https://healthincloud.app/en/healthcare",
      },
    },
  };
}

export default async function HealthcarePage() {
  const patients = await getMyPatients()
  
  // Calculer les statistiques globales
  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.status === 'ACCEPTED').length
  const pendingInvitations = patients.filter(p => p.status === 'PENDING').length
  const acceptedPatients = patients.filter(p => p.status === 'ACCEPTED')
  const totalAttempts = acceptedPatients.reduce((sum, p) => sum + p.stats.totalAttempts, 0)
  const averageScore = acceptedPatients.length > 0 
    ? acceptedPatients.reduce((sum, p) => sum + p.stats.averageScore, 0) / acceptedPatients.length
    : 0
  const totalUnreadMessages = acceptedPatients.reduce((sum, p) => sum + p.stats.unreadMessages, 0)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes patients</h1>
          <p className="text-muted-foreground">
            Suivez l&apos;adhésion et la progression de vos patients
          </p>
        </div>
        <Button asChild>
          <Link href="/healthcare/invite">
            <Plus className="h-4 w-4 mr-2" />
            Inviter un patient
          </Link>
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {activePatients} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">
              En attente de réponse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercices totaux</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Tous patients confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Moyenne de tous les patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Messages non lus */}
      {totalUnreadMessages > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">
                {totalUnreadMessages} message{totalUnreadMessages > 1 ? 's' : ''} non lu{totalUnreadMessages > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Vous avez des messages en attente de vos patients
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vue des patients */}
      {patients.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun patient associé</h3>
              <p className="text-muted-foreground mb-6">
                Commencez par inviter vos premiers patients pour suivre leur progression
              </p>
              <Button asChild>
                <Link href="/healthcare/invite">
                  <Plus className="h-4 w-4 mr-2" />
                  Inviter un patient
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Vue en cartes pour les petits écrans */}
          <div className="block lg:hidden">
            <div className="grid gap-4 md:grid-cols-2">
              {patients.map((patient) => (
                <PatientStatsCard
                  key={patient.id}
                  patient={patient}
                  href={patient.status === 'ACCEPTED' ? `/healthcare/patients/${patient.patientId}` : undefined}
                />
              ))}
            </div>
          </div>

          {/* Vue en tableau pour les grands écrans */}
          <div className="hidden lg:block">
            <PatientsTable patients={patients} />
          </div>
        </div>
      )}
    </div>
  )
}
