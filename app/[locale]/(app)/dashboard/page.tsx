import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const t = useTranslations()

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
