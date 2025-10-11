import { getPatientDetails } from '@/app/actions/healthcare/get-patient-details'
// import { AnalysisKPIs } from '@/components/analyse/analysis-kpis'
// import { DifficultyDistributionChart } from '@/components/analyse/difficulty-distribution-chart'
// import { ExercisePerformanceChart } from '@/components/analyse/exercise-performance-chart'
// import { ExerciseTypeDistributionChart } from '@/components/analyse/exercise-type-distribution-chart'
// import { ScoreEvolutionChart } from '@/components/analyse/score-evolution-chart'
import { PatientMessages } from '@/components/healthcare/patient-messages'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/routing'
import {
    Activity,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Mail,
    MessageSquare,
    TrendingUp,
    User
} from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

interface PatientDetailPageProps {
  params: Promise<{ patientId: string; locale: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ patientId: string; locale: string }>;
}): Promise<Metadata> {
  const { locale, patientId } = await params;
  const t = await getTranslations({ locale, namespace: "healthcare" });

  return {
    title: `Patient - ${patientId}`,
    description: t("title"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PatientDetailPage({ params, searchParams }: PatientDetailPageProps) {
  const { patientId, locale } = await params
  const { tab } = await searchParams
  
  try {
    const patientData = await getPatientDetails({ patientId })
    const { patient, association, stats, exerciseAttempts, messages } = patientData

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const formatTimeAgo = (date: Date) => {
      const now = new Date()
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) return "Aujourd&apos;hui"
      if (diffInDays === 1) return "Hier"
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`
      if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
      return `Il y a ${Math.floor(diffInDays / 30)} mois`
    }

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
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground">
              Suivi détaillé et progression
            </p>
          </div>
        </div>

        {/* Informations du patient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-sm">{patient.email}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Membre depuis</span>
                </div>
                <p className="text-sm">{formatDate(patient.createdAt)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email vérifié</span>
                </div>
                <Badge variant={patient.emailVerified ? "default" : "destructive"}>
                  {patient.emailVerified ? "Oui" : "Non"}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Association</span>
                </div>
                <p className="text-sm">{formatDate(association.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exercices</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              <p className="text-xs text-muted-foreground">
                Total des tentatives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Performance globale
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée totale</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(stats.totalDuration / 60)}min
              </div>
              <p className="text-xs text-muted-foreground">
                Temps d&apos;entraînement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">
                Échanges avec le patient
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets de contenu */}
        <Tabs defaultValue={tab || "analysis"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
            <TabsTrigger value="exercises">Exercices</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            {stats.totalAttempts > 0 ? (
              <>
                {/* <AnalysisKPIs 
                  totalAttempts={stats.totalAttempts}
                  totalDuration={stats.totalDuration}
                  averageScore={stats.averageScore}
                  consistency={0} // TODO: Calculer la consistance
                /> */}
                
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* <ScoreEvolutionChart 
                    exerciseAttempts={exerciseAttempts}
                    timeRange="all"
                  /> */}
                  {/* <ExercisePerformanceChart 
                    exerciseAttempts={exerciseAttempts}
                  /> */}
                </div>
                
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* <DifficultyDistributionChart 
                    exerciseAttempts={exerciseAttempts}
                  /> */}
                  {/* <ExerciseTypeDistributionChart 
                    exerciseAttempts={exerciseAttempts}
                  /> */}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun exercice complété</h3>
                    <p className="text-muted-foreground">
                      Ce patient n&apos;a pas encore complété d&apos;exercices
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
            {exerciseAttempts.length > 0 ? (
              <div className="space-y-4">
                {exerciseAttempts.map((attempt) => (
                  <Card key={attempt.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{attempt.exerciseSlug}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(attempt.completedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {attempt.score ? `${attempt.score.toFixed(1)}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {attempt.duration ? `${Math.floor(attempt.duration / 60)}min` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun exercice</h3>
                    <p className="text-muted-foreground">
                      Ce patient n&apos;a pas encore complété d&apos;exercices
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <PatientMessages
              associationId={association.id}
              patientName={patient.name}
              providerName="Vous" // TODO: Récupérer le nom du soignant
            />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch {
    redirect(`/${locale}/healthcare`)
  }
}
