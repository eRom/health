import { Footer } from "@/components/navigation/footer";
import { Header } from "@/components/navigation/header";
import { AnimatedSection } from "@/components/site/animated-section";
import { ThanksCTACard } from "@/components/site/thanks-cta-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Image from "next/image";

// Optimize static generation
export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching to ensure fresh session data

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageHome" });

  const title = t("hero.title");
  const description = t("hero.description");
  const url = "https://healthincloud.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `${url}/${locale}`,
      siteName: "Health In Cloud",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
      creator: "@healthincloud",
      site: "@healthincloud",
    },
    alternates: {
      canonical: `${url}/${locale}/`,
      languages: {
        fr: `${url}/fr/`,
        en: `${url}/en/`,
      },
    },
  };
}

import {
  BarChart3,
  Brain,
  CheckCircle,
  Mic,
  Moon,
  Shield,
  Smartphone,
  Stethoscope,
  Target,
  User,
  Zap,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageHome" });
  const authT = await getTranslations({ locale, namespace: "auth" });

  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // WebPage structured data for landing page
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("hero.title"),
    description: t("hero.description"),
    url: "https://healthincloud.app",
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Health In Cloud",
      url: "https://healthincloud.app",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero overflow-hidden">
          <div className="container flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-8 px-4 py-12 text-center md:py-16">
            <AnimatedSection variant="fade-up" delay={100}>
              <div className="max-w-2xl space-y-4">
                <h1 className="text-primary text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl mb-2">
                  {t("hero.title")}
                </h1>

                <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {t("hero.description")}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection variant="fade-up" delay={300}>
              <div className="flex flex-col gap-4 sm:flex-row">
                {session?.user ? (
                  <Button
                    asChild
                    size="lg"
                    className="w-full text-base sm:w-56"
                  >
                    <Link href="/dashboard">{t("hero.ctaAuthenticated")}</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full text-base sm:w-56"
                    >
                      <Link href="/auth/signup">{t("hero.cta")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full text-base sm:w-56"
                    >
                      <Link href="/auth/login">{authT("signIn")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection
              variant="fade-up"
              delay={500}
              className="w-full max-w-3xl mx-auto"
            >
              <div className="rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-xl backdrop-blur md:p-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="flex flex-col items-center text-center">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Brain className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="mb-2 text-base font-semibold">
                      {t("hero.highlightGuidedTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("hero.highlightGuidedDescription")}
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Mic className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="mb-2 text-base font-semibold">
                      {t("hero.highlightFeedbackTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("hero.highlightFeedbackDescription")}
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Smartphone className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="mb-2 text-base font-semibold">
                      {t("hero.highlightDevicesTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("hero.highlightDevicesDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Problems & Solutions Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {t("problems.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("problems.description")}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Patients Card */}
              <AnimatedSection variant="slide-right">
                <div className="card-hover overflow-hidden rounded-xl border bg-card shadow-sm h-full">
                  <div className="border-b bg-[var(--color-bg-3)] p-6">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                      <User className="h-6 w-6" aria-hidden="true" />
                      {t("problems.patients.title")}
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="mb-3 text-sm font-semibold">
                          {t("problems.patients.currentDifficulties")}
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• {t("problems.patients.difficulty1")}</li>
                          <li>• {t("problems.patients.difficulty2")}</li>
                          <li>• {t("problems.patients.difficulty3")}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-primary">
                          {t("problems.patients.ourSolution")}
                        </h4>
                        <ul className="space-y-2 text-sm text-primary">
                          <li className="flex items-start gap-2">
                            <CheckCircle
                              className="mt-0.5 h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{t("problems.patients.solution1")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle
                              className="mt-0.5 h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{t("problems.patients.solution2")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle
                              className="mt-0.5 h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{t("problems.patients.solution3")}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Clinicians Card */}
              <AnimatedSection variant="slide-left">
                <div className="card-hover overflow-hidden rounded-xl border bg-card shadow-sm h-full">
                  <div className="border-b bg-[var(--color-bg-3)] p-6">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                      <Stethoscope className="h-6 w-6" aria-hidden="true" />
                      {t("problems.clinicians.title")}
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="mb-3 text-sm font-semibold">
                          {t("problems.clinicians.currentDifficulties")}
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• {t("problems.clinicians.difficulty1")}</li>
                          <li>• {t("problems.clinicians.difficulty2")}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-primary">
                          {t("problems.clinicians.ourSolution")}
                        </h4>
                        <ul className="space-y-2 text-sm text-primary">
                          <li className="flex items-start gap-2">
                            <CheckCircle
                              className="mt-0.5 h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{t("problems.clinicians.solution1")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle
                              className="mt-0.5 h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{t("problems.clinicians.solution2")}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="fonctionnalites"
          className="bg-[var(--color-bg-2)] py-16 md:py-24"
        >
          <div className="container px-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {t("features.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("features.description")}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatedSection variant="fade-up" delay={0}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Target
                      className="h-8 w-8 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">
                    {t("features.guidedExercises.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("features.guidedExercises.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={100}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Zap className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">
                    {t("features.instantFeedback.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("features.instantFeedback.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={200}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <BarChart3
                      className="h-8 w-8 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">
                    {t("features.progressTracking.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("features.progressTracking.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={300}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Smartphone
                      className="h-8 w-8 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">
                    {t("features.mobileFirst.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("features.mobileFirst.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={400}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Moon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">
                    {t("features.darkMode.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("features.darkMode.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={500}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Shield
                      className="h-8 w-8 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">
                    {t("features.gdprCompliant.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("features.gdprCompliant.description")}
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Personas Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {t("testimonials.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("testimonials.description")}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Marie Persona */}
              <AnimatedSection variant="slide-right">
                <div className="rounded-xl border bg-card p-8 shadow-sm h-full">
                  <div className="mb-6 text-center text-6xl">👩‍🦳</div>
                  <div className="mb-4">
                    <h2 className="mb-1 text-lg font-semibold">
                      {t("testimonials.marie.name")}
                    </h2>
                    <p className="mb-1 text-sm font-medium text-primary">
                      {t("testimonials.marie.role")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.marie.condition")}
                    </p>
                  </div>
                  <blockquote className="border-l-4 border-primary pl-4 italic">
                    &ldquo;{t("testimonials.marie.quote")}&rdquo;
                  </blockquote>
                </div>
              </AnimatedSection>

              {/* Dr. Typhaine Persona */}
              <AnimatedSection variant="slide-left">
                <div className="rounded-xl border bg-card p-8 shadow-sm h-full">
                  <div className="mb-6 text-center text-6xl">👩‍⚕️</div>
                  <div className="mb-4">
                    <h2 className="mb-1 text-lg font-semibold">
                      {t("testimonials.drTyphaine.name")}
                    </h2>
                    <p className="mb-1 text-sm font-medium text-primary">
                      {t("testimonials.drTyphaine.role")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.drTyphaine.condition")}
                    </p>
                  </div>
                  <blockquote className="border-l-4 border-primary pl-4 italic">
                    &ldquo;{t("testimonials.drTyphaine.quote")}&rdquo;
                  </blockquote>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* User Journey Section */}
        <section className="bg-[var(--color-bg-5)] py-16 md:py-24">
          <div className="container px-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {t("journey.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("journey.description")}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatedSection variant="fade-up" delay={0}>
                <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm h-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h2 className="mb-2 font-semibold">
                      {t("journey.step1.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("journey.step1.description")}
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={100}>
                <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm h-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h2 className="mb-2 font-semibold">
                      {t("journey.step2.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("journey.step2.description")}
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={200}>
                <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm h-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h2 className="mb-2 font-semibold">
                      {t("journey.step3.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("journey.step3.description")}
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={300}>
                <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm h-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h2 className="mb-2 font-semibold">
                      {t("journey.step4.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("journey.step4.description")}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Differentiators Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {t("technology.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("technology.description")}
                </p>
              </div>
            </AnimatedSection>

            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <AnimatedSection variant="fade-in" delay={0}>
                <div className="text-center">
                  <div className="mx-auto mb-3 text-4xl">📱</div>
                  <h2 className="mb-1 text-sm font-semibold">
                    {t("technology.mobileFirst.title")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("technology.mobileFirst.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-in" delay={100}>
                <div className="text-center">
                  <div className="mx-auto mb-3 text-4xl">♿</div>
                  <h3 className="mb-1 text-sm font-semibold">
                    {t("technology.wcag.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("technology.wcag.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-in" delay={200}>
                <div className="text-center">
                  <div className="mx-auto mb-3 text-4xl">📶</div>
                  <h3 className="mb-1 text-sm font-semibold">
                    {t("technology.offline.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("technology.offline.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-in" delay={300}>
                <div className="text-center">
                  <div className="mx-auto mb-3 text-4xl">🌐</div>
                  <h3 className="mb-1 text-sm font-semibold">
                    {t("technology.bilingual.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("technology.bilingual.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-in" delay={400}>
                <div className="text-center">
                  <div className="mx-auto mb-3 text-4xl">🔒</div>
                  <h3 className="mb-1 text-sm font-semibold">
                    {t("technology.gdpr.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("technology.gdpr.description")}
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-in" delay={500}>
                <div className="text-center">
                  <div className="mx-auto mb-3 text-4xl">⚡</div>
                  <h3 className="mb-1 text-sm font-semibold">
                    {t("technology.performance.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("technology.performance.description")}
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="gradient-cta py-16 md:py-24">
          <div className="container px-4">
            <AnimatedSection variant="fade-up">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {t("cta.title")}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {t("cta.description")}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  {session?.user ? (
                    <Button
                      asChild
                      size="lg"
                      className="w-full text-base sm:w-56"
                    >
                      <Link href="/dashboard">
                        {t("hero.ctaAuthenticated")}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      className="w-full text-base sm:w-56"
                    >
                      <Link href="/auth/signup">{t("cta.createAccount")}</Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full text-base sm:w-56"
                  >
                    <Link href="/about">{t("cta.learnMore")}</Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Mobile App Section */}
        <section className="py-16 md:py-24 hidden md:block">
          <div className="container px-4 shadow-2xl rounded-2xl p-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto max-w-5xl">
                <div className="grid gap-12 md:grid-cols-2 md:items-center">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                      {t("mobileApp.title")}
                    </h2>
                    <p className="mb-6 text-lg text-muted-foreground">
                      {t("mobileApp.description")}
                    </p>
                    <ul className="mb-8 space-y-3">
                      <li className="flex items-start gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                          aria-hidden="true"
                        >
                          <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                          <path d="m9 11 3 3L22 4"></path>
                        </svg>
                        <span className="text-muted-foreground">
                          {t("mobileApp.responsive")}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                          aria-hidden="true"
                        >
                          <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                          <path d="m9 11 3 3L22 4"></path>
                        </svg>
                        <span className="text-muted-foreground">
                          {t("mobileApp.offlineMode")}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                          aria-hidden="true"
                        >
                          <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                          <path d="m9 11 3 3L22 4"></path>
                        </svg>
                        <span className="text-muted-foreground">
                          {t("mobileApp.intuitive")}
                        </span>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      Scannez le QR code pour accéder directement à la
                      plateforme depuis votre mobile
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="rounded-xl bg-white p-4">
                      <Image
                        src="/qr-code.png"
                        alt="QR Code pour accéder à Health In Cloud"
                        width={256}
                        height={256}
                        className="h-auto w-64"
                        loading="lazy"
                        sizes="(max-width: 768px) 256px, 256px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Thanks CTA Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl">
              <ThanksCTACard />
            </div>
          </div>
        </section>

        {/* Tipeee Support Section */}
        <section className="py-12 md:py-16">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center shadow-lg">
                <div className="mb-4 text-4xl">💙</div>
                <h2 className="mb-3 text-2xl font-bold tracking-tight">
                  {t("support.title")}
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {t("support.description")}
                </p>
                <Button asChild size="lg" className="gap-2">
                  <a
                    href="https://fr.tipeee.com/rebondir-apres-lavc-ma-carriere-dans-la-tech"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>☕</span>
                    <span>{t("support.button")}</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
