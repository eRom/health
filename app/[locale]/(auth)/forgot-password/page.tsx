'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [cooldownMessage, setCooldownMessage] = useState('')

  // Load cooldown from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('password-reset-cooldown')
    if (stored) {
      const { expiry, email: storedEmail } = JSON.parse(stored)
      const remaining = Math.ceil((expiry - Date.now()) / 1000)
      if (remaining > 0) {
        setCooldown(remaining)
        setEmail(storedEmail)
        setCooldownMessage(`Vous pourrez renvoyer un email dans ${remaining}s`)
      } else {
        localStorage.removeItem('password-reset-cooldown')
      }
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          const newValue = prev - 1
          if (newValue <= 0) {
            localStorage.removeItem('password-reset-cooldown')
            setCooldownMessage('')
            return 0
          }
          setCooldownMessage(`Vous pourrez renvoyer un email dans ${newValue}s`)
          return newValue
        })
      }, 1000)

      return () => clearInterval(timer)
    }

    return undefined
  }, [cooldown])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Erreur lors de l\'envoi de l\'email')
        // If rate limited, set the cooldown from server
        if (data.error?.cooldown) {
          setCooldown(data.error.cooldown)
          const expiry = Date.now() + data.error.cooldown * 1000
          localStorage.setItem('password-reset-cooldown', JSON.stringify({ expiry, email }))
        }
        return
      }

      setSuccess(true)
      
      // Set 60-second cooldown on success
      if (data.cooldown) {
        setCooldown(data.cooldown)
        const expiry = Date.now() + data.cooldown * 1000
        localStorage.setItem('password-reset-cooldown', JSON.stringify({ expiry, email }))
        setCooldownMessage(`Vous pourrez renvoyer un email dans ${data.cooldown}s`)
      }
    } catch (error) {
      logger.error(error, '[FORGOT_PASSWORD] Error')
      setError('Erreur lors de l\'envoi de l\'email de réinitialisation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-12">
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle className="text-xl">
              {t("auth.dialogForgotPassword.title")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("auth.dialogForgotPassword.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {success && (
              <Alert>
                <AlertDescription>
                  {t("auth.dialogForgotPassword.success")}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {cooldown > 0 && !error && (
              <Alert>
                <AlertDescription>{cooldownMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-8">
              <div className="space-y-4">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t("auth.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.dialogForgotPassword.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={isLoading || cooldown > 0}
                >
                  <Link href="/auth/login">
                    {t("auth.dialogForgotPassword.cancel")}
                  </Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={isLoading || cooldown > 0}
                >
                  {isLoading
                    ? "Envoi..."
                    : cooldown > 0
                      ? `${t("auth.dialogForgotPassword.wait")} ${cooldown}s`
                      : t("auth.dialogForgotPassword.signIn")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
