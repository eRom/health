import { getBadges } from "@/app/actions/get-badges";
import { getDashboardStats } from "@/app/actions/get-dashboard-stats";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { BadgeSummary } from "@/components/badges/badge-summary";
import { RecentExercisesList } from "@/components/dashboard/recent-exercises-list";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Button } from "@/components/ui/button";
import { Link, redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tableau de bord",
    description:
      "Suivez votre progression et accédez à vos exercices de rééducation personnalisés",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect({ href: "/auth/login", locale });
    return null;
  }

  const ensuredSession = session;
  const userName = ensuredSession.user.name?.split(" ")[0] || "Marie";

  // Fetch dashboard data
  const [{ stats, recentExercises }, { badges, stats: badgeStats }] =
    await Promise.all([getDashboardStats(), getBadges()]);

  return (
    <div className="container py-8">
      {/* Email verification banner */}
      {!ensuredSession.user.emailVerified && (
        <div className="mb-6">
          <EmailVerificationBanner
            userEmail={ensuredSession.user.email}
            userLocale={locale}
          />
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">
          {t("welcome", { name: userName })}
        </h1>
        <Button asChild>
          <Link href="/dashboard/analyse">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t("analyse")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Stats Cards */}
        <StatsCards
          stats={stats}
          translations={{
            totalExercises: t("stats.totalExercises"),
            totalDuration: t("stats.totalDuration"),
            averageScore: t("stats.averageScore"),
            streak: t("stats.streak"),
          }}
        />

        {/* Badge Summary */}
        <BadgeSummary badges={badges} stats={badgeStats} />

        {/* Recent Exercises */}
        <RecentExercisesList
          exercises={recentExercises}
          translations={{
            title: t("recentExercises"),
            noExercises: t("noExercises"),
            noExercisesDescription: t("noExercisesDescription"),
          }}
        />
      </div>
    </div>
  );
}
