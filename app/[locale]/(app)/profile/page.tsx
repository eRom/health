import { ActiveSessions } from "@/components/profile/active-sessions";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { EditNameForm } from "@/components/profile/edit-name-form";
import { LocalePreference } from "@/components/profile/locale-preference";
import { MyProviderSection } from "@/components/profile/my-provider-section";
import { NotificationPreference } from "@/components/profile/notification-preference";
import { SecurityInfo } from "@/components/profile/security-info";
import { ThemePreference } from "@/components/profile/theme-preference";
import { ThemeStyleSelector } from "@/components/profile/theme-style-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect({ href: "/auth/login", locale });
  }

  const { user } = session!;

  // Fetch user data with preferences
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      createdAt: true,
      locale: true,
      themeStyle: true,
      emailNotifications: true,
      role: true,
    },
  });

  const createdAt = userData?.createdAt || new Date();
  const userLocale = userData?.locale || "fr";
  const userThemeStyle = userData?.themeStyle || "default";
  const emailNotifications = userData?.emailNotifications ?? true;

  // Fetch user account (for provider info)
  const account = await prisma.account.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      providerId: true,
      accountId: true,
    },
  });

  // Fetch all user sessions
  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const isCredentialAuth = account?.providerId === "credential";

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
              <p className="text-sm font-medium text-muted-foreground">
                Membre depuis
              </p>
              <p className="text-lg">
                {createdAt.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mon soignant - seulement pour les patients */}
        {userData?.role !== "HEALTHCARE_PROVIDER" && <MyProviderSection />}

        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LocalePreference currentLocale={userLocale} />

            <div className="border-t pt-6">
              <ThemePreference />
            </div>

            <div className="border-t pt-6">
              <ThemeStyleSelector initialStyle={userThemeStyle as "default" | "amber" | "perpetuity"} />
            </div>

            <div className="border-t pt-6">
              <NotificationPreference
                currentEmailNotifications={emailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Paramètres de sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SecurityInfo account={account} />

            {isCredentialAuth && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Mot de passe
                </p>
                <ChangePasswordDialog />
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Sessions actives</h3>
              <ActiveSessions
                sessions={sessions}
                currentSessionId={session!.session.id}
              />
            </div>
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
                <strong>⚠️ Attention :</strong> La suppression de votre compte
                est définitive et irréversible. Toutes vos données personnelles
                et votre historique d&apos;exercices seront supprimés
                immédiatement.
              </AlertDescription>
            </Alert>
            <div className="mt-6">
              <DeleteAccountDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
