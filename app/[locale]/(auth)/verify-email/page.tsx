'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-4">
            {t("auth.verifyEmail.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.verifyEmail.subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">
              {t("auth.verifyEmail.cardTitle")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("auth.verifyEmail.cardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              <p>{t("auth.verifyEmail.helpTitle")}</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>{t("auth.verifyEmail.helpItem1")}</li>
                <li>{t("auth.verifyEmail.helpItem2")}</li>
                <li>{t("auth.verifyEmail.helpItem3")}</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-2">
              <Button asChild variant="outline" className="flex-1 h-11">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("auth.verifyEmail.backToHome")}
                </Link>
              </Button>
              <Button asChild className="flex-1 h-11">
                <Link href="/dashboard">{t("auth.verifyEmail.continue")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}