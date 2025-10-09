'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function SignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await authClient.signUp.email({
        email,
        password,
        name,
      });

      router.push("/verify-email");
    } catch {
      setError("Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
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
        <label htmlFor="name" className="text-sm font-medium">
          {t("auth.dialogSignin.nameLabel")}
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={t("auth.dialogSignin.namePlaceholder")}
          required
          disabled={isLoading}
          className="h-11"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="email" className="text-sm font-medium">
          {t("auth.dialogSignin.emailLabel")}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("auth.dialogSignin.emailPlaceholder")}
          required
          disabled={isLoading}
          className="h-11"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="password" className="text-sm font-medium">
          {t("auth.dialogSignin.passwordLabel")}
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          disabled={isLoading}
          className="h-11"
          placeholder={t("auth.dialogSignin.passwordPlaceholder")}
        />
      </div>

      <div className="flex gap-4 pt-2">
        <Button
          asChild
          variant="outline"
          className="flex-1 h-11"
          disabled={isLoading}
        >
          <Link href="/">{t("auth.dialogSignin.cancel")}</Link>
        </Button>
        <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
          {isLoading ? t("common.loading") : t("auth.dialogSignin.signIn")}
        </Button>
      </div>
    </form>
  );
}
