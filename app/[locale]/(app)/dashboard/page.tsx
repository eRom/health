import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

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
  const t = await getTranslations()

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {t('dashboard.welcome', { name: 'Marie' })}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.yourProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Suivi de votre progression à venir...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentExercises')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.noExercises')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
