'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export function LoginForm() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        setError(response.error.message || "Email ou mot de passe incorrect");
        return;
      }

      // ✅ CORRECTIF : Utiliser le router Next-Intl pour préserver la locale
      router.push("/dashboard");
    } catch (err) {
      setError('Email ou mot de passe incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          {t('auth.email')}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nom@exemple.fr"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          {t('auth.password')}
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-3 mt-2">
        <Button asChild variant="outline" className="flex-1" disabled={isLoading}>
          <Link href="/">Annuler</Link>
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Connexion...' : t('auth.signIn')}
        </Button>
      </div>
    </form>
  )
}
