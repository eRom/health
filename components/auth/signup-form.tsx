'use client'

import { signUpWithConsent } from "@/app/actions/signup-with-consent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/i18n/routing";
import { SignupSchema } from "@/lib/schemas/auth";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GoogleButton } from "./google-button";

export function SignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validation côté client avec Zod
    const validationResult = SignupSchema.safeParse({
      name,
      email,
      password,
      healthDataConsent: consentChecked,
    });

    if (!validationResult.success) {
      setError(
        validationResult.error.issues[0]?.message || "Erreur de validation"
      );
      setIsLoading(false);
      return;
    }

    try {
      await signUpWithConsent({
        name,
        email,
        password,
        healthDataConsent: consentChecked,
      });

      router.push("/verify-email");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du compte"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <GoogleButton className="w-full h-11" disabled />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("auth.orSeparator")}
          </span>
        </div>
      </div>

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
            <Link href="/">{t("auth.dialogSignin.cancel")}</Link>
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11"
            disabled
          >
            {isLoading ? t("common.loading") : t("auth.dialogSignin.signIn")}
          </Button>
        </div>
      </form>
    </div>
  );
}
