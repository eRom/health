import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.signUp')}</CardTitle>
          <CardDescription>
            Créez votre compte pour commencer vos exercices de rééducation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />

          <div className="mt-4 text-center text-sm">
            Vous avez déjà un compte ?{' '}
            <Link href="/auth/login" className="underline">
              {t('auth.signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
