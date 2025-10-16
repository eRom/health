import { Footer } from "@/components/navigation/footer";
import { Header } from "@/components/navigation/header";
import { AnimatedSection } from "@/components/site/animated-section";
import { PricingButton } from "@/components/subscription/pricing-button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { CheckCircle, Star, Zap } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

// Optimize static generation
export const dynamic = "force-static";
export const revalidate = 86400; // Revalidate once per day

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pagePricing" });

  const title = t("metadata.title");
  const description = t("metadata.description");
  const url = "https://healthincloud.app";

  return {
    title,
    description,
    keywords: [
      "tarifs",
      "prix",
      "abonnement",
      "essai gratuit",
      "rééducation",
      "orthophonie",
      "neuropsychologie",
      "pricing",
      "subscription",
      "free trial",
      "rehabilitation",
      "speech therapy",
      "neuropsychology",
    ],
    alternates: {
      canonical: `${url}/${locale}/pricing`,
      languages: {
        fr: `${url}/fr/pricing`,
        en: `${url}/en/pricing`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `${url}/${locale}/pricing`,
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
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pagePricing" });
  const subscriptionT = await getTranslations({ locale, namespace: "subscription" });

  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Schema.org structured data for pricing
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("title"),
    description: t("metadata.description"),
    url: `https://healthincloud.app/${locale}/pricing`,
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Health In Cloud",
      url: "https://healthincloud.app",
    },
    mainEntity: [
      {
        "@type": "Product",
        name: "Health In Cloud - Abonnement Mensuel",
        description: "Accès complet à tous les exercices de rééducation",
        offers: {
          "@type": "Offer",
          price: "19",
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "19",
            priceCurrency: "EUR",
            unitText: "monthly",
          },
          availability: "https://schema.org/InStock",
          validFrom: new Date().toISOString().split("T")[0],
        },
      },
      {
        "@type": "Product",
        name: "Health In Cloud - Abonnement Annuel",
        description: "Accès complet à tous les exercices de rééducation avec économies",
        offers: {
          "@type": "Offer",
          price: "180",
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "180",
            priceCurrency: "EUR",
            unitText: "yearly",
          },
          availability: "https://schema.org/InStock",
          validFrom: new Date().toISOString().split("T")[0],
        },
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Section with Pricing Table */}
        <section className="gradient-hero overflow-hidden">
          <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 py-12 text-center md:py-16">
            <AnimatedSection variant="fade-up" delay={100}>
              <div className="max-w-3xl space-y-4">
                <h1 className="text-primary text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                  {t("title")}
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {t("subtitle")}
                </p>
              </div>
            </AnimatedSection>

            {/* Pricing Table with Animations */}
            <div className="w-full max-w-4xl">
              <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                {/* Monthly Plan - Slide from left */}
                <AnimatedSection variant="slide-left" delay={300}>
                  <div className="relative flex flex-col">
                    <div className="card-hover rounded-xl border bg-card p-6 shadow-sm h-full">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">{t("plans.monthly.title")}</h2>
                          <p className="text-muted-foreground">
                            {t("plans.monthly.description")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{t("plans.monthly.price")}</span>
                            <span className="text-muted-foreground">{t("plans.monthly.period")}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("plans.monthly.trial")}
                          </p>
                        </div>

                        <ul className="space-y-3">
                        
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.unlimitedAccess")}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.progressTracking")}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.personalizedDashboard")}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.emailSupport")}</span>
                          </li>
                        </ul>

                        <div className="pt-4">
                          <PricingButton
                            plan="monthly"
                            className="w-full"
                            size="lg"
                          >
                            {t("plans.monthly.button")}
                          </PricingButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Yearly Plan - Slide from right */}
                <AnimatedSection variant="slide-right" delay={400}>
                  <div className="relative flex flex-col">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {t("plans.yearly.badge")}
                      </div>
                    </div>
                    <div className="card-hover rounded-xl border border-primary bg-card p-6 shadow-lg h-full">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">{t("plans.yearly.title")}</h2>
                          <p className="text-muted-foreground">
                            {t("plans.yearly.description")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{t("plans.yearly.price")}</span>
                            <span className="text-muted-foreground">{t("plans.yearly.period")}</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-500 font-medium">
                            {t("plans.yearly.savings")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("plans.yearly.trial")}
                          </p>
                        </div>

                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.unlimitedAccess")}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.progressTracking")}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.personalizedDashboard")}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                            <span className="text-sm">{subscriptionT("features.emailSupport")}</span>
                          </li>
                        </ul>

                        <div className="pt-4">
                          <PricingButton
                            plan="yearly"
                            className="w-full"
                            size="lg"
                          >
                            {t("plans.yearly.button")}
                          </PricingButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-[var(--color-bg-2)] py-16 md:py-24">
          <div className="container px-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {t("benefits.title")}
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatedSection variant="fade-up" delay={0}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Zap className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {t("benefits.item1")}
                  </h3>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={100}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <CheckCircle className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {t("benefits.item2")}
                  </h3>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={200}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Star className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {t("benefits.item3")}
                  </h3>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={300}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <CheckCircle className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {t("benefits.item4")}
                  </h3>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={400}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Star className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {t("benefits.item5")}
                  </h3>
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-up" delay={500}>
                <div className="card-hover rounded-xl border bg-card p-6 text-center shadow-sm h-full">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Zap className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {t("benefits.item6")}
                  </h3>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Trial Information Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <AnimatedSection variant="fade-in">
              <div className="mx-auto max-w-4xl">
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <h2 className="mb-4 text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
                        {t("trial.title")}
                      </h2>
                      <p className="mb-8 text-lg text-blue-800 dark:text-blue-200">
                        {t("trial.description")}
                      </p>
                      
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {t("trial.item1")}
                          </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {t("trial.item2")}
                          </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {t("trial.item3")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
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
                    <PricingButton
                      plan="monthly"
                      size="lg"
                      className="w-full text-base sm:w-56"
                    >
                      {t("cta.button")}
                    </PricingButton>
                  ) : (
                    <PricingButton
                      plan="monthly"
                      size="lg"
                      className="w-full text-base sm:w-56"
                    >
                      {t("cta.button")}
                    </PricingButton>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
