import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  
  return {
    title: t("auth.signIn"),
    description: t("auth.signInDescription"),
    alternates: {
      canonical: `https://healthincloud.app/${locale}/auth/login`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LoginPage() {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.signIn')}</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour accéder à vos exercices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />

          <div className="mt-4 text-center text-sm">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="underline">
              {t('auth.signUp')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
