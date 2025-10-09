import { Footer } from "@/components/navigation/footer";
import { Header } from "@/components/navigation/header";
import {
  StructuredData,
  createWebPageSchema,
} from "@/components/seo/structured-data";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// Use dynamic rendering for now
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [
    { locale: "fr" },
    { locale: "en" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageLegal" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `https://healthincloud.app/${locale}/legal`,
      languages: {
        fr: "https://healthincloud.app/fr/legal",
        en: "https://healthincloud.app/en/legal",
      },
    },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageLegal" });

  const schema = createWebPageSchema(
    t("title"),
    t("metadata.description"),
    `https://healthincloud.app/${locale}/legal`
  );

  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData data={schema} />
      <Header />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">{t("title")}</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("publisher.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("publisher.intro")}
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2">
                    <strong>{t("publisher.companyName")}</strong>{" "}
                    {t("publisher.companyValue")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("publisher.legalForm")}</strong>{" "}
                    {t("publisher.legalFormValue")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("publisher.headquarters")}</strong>{" "}
                    {t("publisher.headquartersValue")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("publisher.email")}</strong>{" "}
                    {t("publisher.emailValue")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("publisher.siret")}</strong>{" "}
                    {t("publisher.siretValue")}
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("director.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("director.description")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("hosting.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("hosting.intro")}
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2">
                    <strong>{t("hosting.host")}</strong>{" "}
                    {t("hosting.vercel.name")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("hosting.region")}</strong>{" "}
                    {t("hosting.vercel.region")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("hosting.website")}</strong>{" "}
                    <a
                      href="https://vercel.com"
                      className="text-primary hover:underline"
                    >
                      {t("hosting.vercel.url")}
                    </a>
                  </p>
                </div>
                <p className="mt-4 mb-4 text-muted-foreground">
                  {t("hosting.databaseIntro")}
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2">
                    <strong>{t("hosting.host")}</strong>{" "}
                    {t("hosting.neon.name")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("hosting.region")}</strong>{" "}
                    {t("hosting.neon.region")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("hosting.website")}</strong>{" "}
                    <a
                      href="https://neon.tech"
                      className="text-primary hover:underline"
                    >
                      {t("hosting.neon.url")}
                    </a>
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("intellectual.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("intellectual.p1")}
                </p>
                <p className="mb-4 text-muted-foreground">
                  {t("intellectual.p2")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("dataProtection.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("dataProtection.p1")}
                </p>
                <p className="mb-4 text-muted-foreground">
                  {t("dataProtection.p2")}{" "}
                  <Link href="/gdpr" className="text-primary hover:underline">
                    {t("dataProtection.privacyLink")}
                  </Link>
                  .
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("responsibility.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("responsibility.p1")}
                </p>
                <p className="mb-4 text-muted-foreground">
                  {t("responsibility.p2")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("hyperlinks.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("hyperlinks.description")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("applicableLaw.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("applicableLaw.description")}
                </p>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("contact.title")}
                </h2>
                <p className="mb-2 text-muted-foreground">
                  {t("contact.intro")}
                </p>
                <p className="text-muted-foreground">
                  {t("contact.email")}{" "}
                  <a
                    href="mailto:contact@healthincloud.app"
                    className="text-primary hover:underline"
                  >
                    contact@healthincloud.app
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
