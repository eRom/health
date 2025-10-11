import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/i18n/routing"
import { validatePasswordResetToken } from "@/lib/security/password-reset"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string; tokenId?: string }>
}

async function ResetPasswordContent({
  token,
  tokenId,
  locale,
}: {
  token?: string
  tokenId?: string
  locale: string
}) {
  const t = await getTranslations({ locale, namespace: "auth" })
  
  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            {t("resetPassword.title")}
          </CardTitle>
          <CardDescription>
            {t("resetPassword.noToken")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {t("resetPassword.noTokenDescription")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const validation = await validatePasswordResetToken({
    tokenId,
    token,
  })

  if (validation.status !== "valid") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            {t("resetPassword.invalidToken")}
          </CardTitle>
          <CardDescription>
            {t("resetPassword.invalidTokenDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {t("resetPassword.invalidTokenMessage")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const { record } = validation

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {t("resetPassword.validToken")}
        </CardTitle>
        <CardDescription>
          {t("resetPassword.validTokenDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {t("resetPassword.validTokenMessage")}
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link
            href={{
              pathname: "/reset-password-form",
              query: {
                token,
                tokenId: record.tokenId ?? undefined,
              },
            }}
            locale={locale}
          >
            {t("resetPassword.createNewPassword")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  const { locale } = await params
  const { token, tokenId } = await searchParams
  const t = await getTranslations({ locale, namespace: "auth" })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("resetPassword.title")}
          </h1>
        </div>
        
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                {t("resetPassword.validTokenDescription")}
              </CardTitle>
            </CardHeader>
          </Card>
        }>
          <ResetPasswordContent token={token} tokenId={tokenId} locale={locale} />
        </Suspense>
      </div>
    </div>
  )
}
