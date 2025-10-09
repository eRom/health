"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

interface EmailVerificationBannerProps {
  userEmail: string
  userLocale?: string
}

export function EmailVerificationBanner({
  userEmail,
  userLocale = "fr",
}: EmailVerificationBannerProps) {
  const t = useTranslations("auth.verifyEmail")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleResendEmail = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      await authClient.forgetPassword({
        email: userEmail,
        redirectTo: `/${userLocale}/verify-email`,
      })
      
      setMessage({
        type: "success",
        text: t("successMessage"),
      })
    } catch (error) {
      console.error("[RESEND_VERIFICATION] Error:", error)
      setMessage({
        type: "error",
        text: t("errorMessage"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Mail className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">
              {t("title")}
            </p>
            <p className="text-sm mt-1">
              {t("subtitle")} <strong>{userEmail}</strong>.{" "}
              {t("cardDescription")}
            </p>
            {message && (
              <p
                className={`text-sm mt-2 ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
          <div className="ml-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResendEmail}
              disabled={isLoading}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              {isLoading ? t("sending") : t("resend")}
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
