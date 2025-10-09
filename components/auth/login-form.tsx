'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      console.log("[LOGIN DEBUG] Response:", response);

      if (response.error) {
        setError(response.error.message || "Email ou mot de passe incorrect");
        return;
      }

      console.log("[LOGIN DEBUG] Login successful, redirecting to dashboard");
      
      // ✅ CORRECTIF : Utiliser le router Next-Intl pour préserver la locale
      router.push("/dashboard");
    } catch (error) {
      console.error("[LOGIN DEBUG] Login error:", error);
      setError("Email ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
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
        <label htmlFor="email" className="text-sm font-medium">
          {t("auth.email")}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nom@exemple.fr"
          required
          disabled={isLoading}
          className="h-12"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="password" className="text-sm font-medium">
          {t("auth.password")}
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
          className="h-12"
        />
      </div>

      {/* Mot de passe oublié - Lien explicite */}
      <div className="flex justify-end pt-2">
        <Link
          href="/forgot-password"
          className="text-sm text-teal-600 hover:text-teal-500 underline font-medium"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          asChild
          variant="outline"
          className="flex-1 h-12"
          disabled={isLoading}
        >
          <Link href="/">Annuler</Link>
        </Button>
        <Button type="submit" className="flex-1 h-12" disabled={isLoading}>
          {isLoading ? "Connexion..." : t("auth.signIn")}
        </Button>
      </div>
    </form>
  );
}
