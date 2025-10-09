import { Footer } from "@/components/navigation/footer";
import { Header } from "@/components/navigation/header";
import {
  StructuredData,
  createWebPageSchema,
} from "@/components/seo/structured-data";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// Optimize static generation
export const dynamic = "force-static";
export const revalidate = 86400; // Revalidate once per day

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageAbout" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `https://healthincloud.app/${locale}/about`,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageAbout" });

  const schema = createWebPageSchema(
    t("title"),
    t("metadata.description"),
    `https://healthincloud.app/${locale}/about`
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
                  {t("mission.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">{t("mission.p1")}</p>
                <p className="mb-4 text-muted-foreground">{t("mission.p2")}</p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("approach.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("approach.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>{t("approach.item1")}</li>
                  <li>{t("approach.item2")}</li>
                  <li>{t("approach.item3")}</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("values.title")}
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">
                      {t("values.accessibility.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("values.accessibility.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">
                      {t("values.security.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("values.security.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">
                      {t("values.innovation.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("values.innovation.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 text-lg font-semibold">
                      {t("values.collaboration.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("values.collaboration.description")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center shadow-lg">
                <div className="mb-4 text-4xl">💙</div>
                <h2 className="mb-3 text-2xl font-bold tracking-tight">
                  {t("support.title")}
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {t("support.description")}
                </p>
                <a
                  href="https://fr.tipeee.com/rebondir-apres-lavc-ma-carriere-dans-la-tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <span>☕</span>
                  <span>{t("support.cta")}</span>
                </a>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("contact.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("contact.intro")}
                </p>
                <p className="text-muted-foreground">
                  {t("contact.emailLabel")}{" "}
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
