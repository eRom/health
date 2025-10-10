'use client'

import { grantConsent } from "@/app/actions/grant-consent"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useState } from "react"

export default function ConsentPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)

  const handleGrantConsent = async () => {
    if (!consentChecked) {
      setError("Vous devez accepter le consentement pour continuer")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await grantConsent()
      router.push("/dashboard")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'octroi du consentement"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            {t("auth.consent.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.consent.subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">
              {t("auth.consent.cardTitle")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("auth.consent.cardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground space-y-4">
              <p>{t("auth.consent.helpTitle")}</p>
              <ul className="list-disc list-inside space-y-2">
                <li>{t("auth.consent.helpItem1")}</li>
                <li>{t("auth.consent.helpItem2")}</li>
                <li>{t("auth.consent.helpItem3")}</li>
                <li>{t("auth.consent.helpItem4")}</li>
              </ul>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-md bg-destructive/15 p-4 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <label htmlFor="consent" className="text-sm leading-relaxed">
                  {t("auth.consent.label")}
                </label>
              </div>
              {!consentChecked && (
                <p className="text-sm text-destructive">
                  {t("auth.consent.required")}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                asChild
                variant="outline"
                className="flex-1 h-11"
                disabled={isLoading}
              >
                <Link href="/">{t("auth.consent.decline")}</Link>
              </Button>
              <Button
                onClick={handleGrantConsent}
                className="flex-1 h-11"
                disabled={isLoading || !consentChecked}
              >
                {isLoading ? t("common.loading") : t("auth.consent.accept")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
