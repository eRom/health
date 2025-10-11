import { getPatientDetails } from "@/app/actions/healthcare/get-patient-details";
import { PatientMessages } from "@/components/healthcare/patient-messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  LineChart,
  MessageSquare,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; patientId: string }>;
}): Promise<Metadata> {
  const { locale, patientId } = await params;
  const t = await getTranslations({
    locale,
    namespace: "healthcare.patientDetails",
  });

  return {
    title: t("title"),
    description: t("description"),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `https://healthincloud.app/${locale}/healthcare/patients/${patientId}`,
      languages: {
        fr: `https://healthincloud.app/fr/healthcare/patients/${patientId}`,
        en: `https://healthincloud.app/en/healthcare/patients/${patientId}`,
      },
    },
  };
}

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; patientId: string }>;
}) {
  const { locale, patientId } = await params;
  const dateLocale = locale === "fr" ? fr : enUS;

  try {
    const patientData = await getPatientDetails({ patientId });

    if (!patientData) {
      redirect(`/${locale}/healthcare`);
    }

    const { patient, association, stats, exerciseAttempts, messages } =
      patientData;

    const { name, email, createdAt, healthDataConsentGrantedAt } = patient;

    // Calculer les messages non lus
    const unreadMessages = messages.filter(
      (msg) => msg.sender.role === "HEALTHCARE_PROVIDER" && !msg.read
    ).length;

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
            <h1 className="text-3xl font-bold">Patient : {name || email}</h1>
            <p className="text-muted-foreground">
              Membre depuis le {format(createdAt, "PP", { locale: dateLocale })}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Users className="h-4 w-4 mr-2" />
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <LineChart className="h-4 w-4 mr-2" />
              Analyse
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages{" "}
              {unreadMessages > 0 && (
                <Badge variant="destructive">{unreadMessages}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cartes de statistiques */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Exercices complétés
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalAttempts}
                  </div>
                  <p className="text-xs text-muted-foreground">terminés</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Temps total
                  </CardTitle>
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
                  <CardTitle className="text-sm font-medium">
                    Score moyen
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.averageScore.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    performance globale
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Consentement RGPD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {healthDataConsentGrantedAt ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Consentement RGPD
                </CardTitle>
                <CardDescription>
                  Statut du consentement du patient pour le traitement de ses
                  données de santé.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthDataConsentGrantedAt ? (
                  <p className="text-sm text-muted-foreground">
                    Consentement accordé le{" "}
                    {format(healthDataConsentGrantedAt, "PP", {
                      locale: dateLocale,
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-red-500">
                    Le patient n&apos;a pas encore accordé son consentement pour
                    le traitement de ses données de santé.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Historique des exercices */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des exercices</CardTitle>
                <CardDescription>
                  Liste des exercices complétés par le patient.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exerciseAttempts.length === 0 ? (
                  <p className="text-muted-foreground">
                    Ce patient n&apos;a pas encore complété d&apos;exercices
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left">Exercice</th>
                          <th className="p-2 text-left">Score</th>
                          <th className="p-2 text-left">Durée</th>
                          <th className="p-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exerciseAttempts.map((attempt) => (
                          <tr key={attempt.id} className="border-b">
                            <td className="p-2 font-medium">
                              {attempt.exerciseSlug}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  attempt.score && attempt.score >= 70
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {attempt.score
                                  ? `${attempt.score.toFixed(0)}%`
                                  : "-"}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {attempt.duration ? `${attempt.duration}s` : "-"}
                            </td>
                            <td className="p-2">
                              {format(attempt.completedAt, "PP", {
                                locale: dateLocale,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {stats.totalAttempts > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Analyses détaillées
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Les graphiques d&apos;analyse seront disponibles
                      prochainement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Aucune donnée d&apos;analyse disponible
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Ce patient n&apos;a pas encore complété d&apos;exercices
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <PatientMessages
              associationId={association.id}
              patientName={name || email}
              providerName="Votre soignant"
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch {
    redirect(`/${locale}/healthcare`);
  }
}
