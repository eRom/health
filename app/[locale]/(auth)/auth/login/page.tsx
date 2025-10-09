import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const url = "https://healthincloud.app";

  return {
    title: t("auth.signIn"),
    description: t("auth.signInDescription"),
    keywords: [
      "connexion",
      "authentification",
      "rééducation",
      "orthophonie",
      "neuropsychologie",
      "login",
      "authentication",
      "rehabilitation",
    ],
    alternates: {
      canonical: `${url}/${locale}/auth/login`,
      languages: {
        fr: `${url}/fr/auth/login`,
        en: `${url}/en/auth/login`,
      },
    },
    openGraph: {
      title: t("auth.signIn"),
      description: t("auth.signInDescription"),
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `${url}/${locale}/auth/login`,
      siteName: "Health In Cloud",
    },
    twitter: {
      card: "summary",
      title: t("auth.signIn"),
      description: t("auth.signInDescription"),
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <main className="w-full max-w-md">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              {t("auth.signIn")}
            </h1>
            <CardDescription>
              Connectez-vous à votre compte pour accéder à vos exercices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />

            <div className="mt-4 text-center text-sm">
              Pas encore de compte ?{" "}
              <Link href="/auth/signup" className="underline">
                {t("auth.signUp")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
