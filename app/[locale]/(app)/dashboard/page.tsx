import { getTranslations } from 'next-intl/server'
import { getDashboardStats } from '@/app/actions/get-dashboard-stats'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentExercisesList } from '@/components/dashboard/recent-exercises-list'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tableau de bord',
    description: 'Suivez votre progression et accédez à vos exercices de rééducation personnalisés',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }

  const userName = session.user.name?.split(' ')[0] || 'Marie'

  // Fetch dashboard data
  const { stats, recentExercises } = await getDashboardStats()

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {t('welcome', { name: userName })}
      </h1>

      <div className="space-y-8">
        {/* Stats Cards */}
        <StatsCards
          stats={stats}
          translations={{
            totalExercises: t('stats.totalExercises'),
            totalDuration: t('stats.totalDuration'),
            averageScore: t('stats.averageScore'),
            streak: t('stats.streak'),
          }}
        />

        {/* Recent Exercises */}
        <RecentExercisesList
          exercises={recentExercises}
          translations={{
            title: t('recentExercises'),
            noExercises: t('noExercises'),
            noExercisesDescription: t('noExercisesDescription'),
          }}
        />
      </div>
    </div>
  )
}
