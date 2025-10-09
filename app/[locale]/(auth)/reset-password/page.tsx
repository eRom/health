import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}

async function ResetPasswordContent({ token }: { token?: string }) {
  const t = useTranslations()
  
  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            {t('auth.resetPassword.title')}
          </CardTitle>
          <CardDescription>
            {t('auth.resetPassword.noToken')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {t('auth.resetPassword.noTokenDescription')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  try {
    // Find verification token
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!verification) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              {t('auth.resetPassword.invalidToken')}
            </CardTitle>
            <CardDescription>
              {t('auth.resetPassword.invalidTokenDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {t('auth.resetPassword.invalidTokenMessage')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verification.identifier },
    })

    if (!user) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              {t('auth.resetPassword.userNotFound')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {t('auth.resetPassword.userNotFoundMessage')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t('auth.resetPassword.validToken')}
          </CardTitle>
          <CardDescription>
            {t('auth.resetPassword.validTokenDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {t('auth.resetPassword.validTokenMessage')}
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <a href={`/reset-password-form?token=${token}`}>
              {t('auth.resetPassword.createNewPassword')}
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('[RESET_PASSWORD] Error:', error)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            {t('auth.resetPassword.error')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {t('auth.resetPassword.errorMessage')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { locale } = await params
  const { token } = await searchParams
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'fr' ? 'Réinitialisation du mot de passe' : 'Password Reset'}
          </h1>
        </div>
        
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                {locale === 'fr' ? 'Vérification en cours...' : 'Verifying...'}
              </CardTitle>
            </CardHeader>
          </Card>
        }>
          <ResetPasswordContent token={token} />
        </Suspense>
      </div>
    </div>
  )
}
