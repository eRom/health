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
  const t = await getTranslations({ locale, namespace: "pageGDPR" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default async function GDPRPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageGDPR" });

  const schema = createWebPageSchema(
    t("title"),
    t("metadata.description"),
    `https://healthincloud.app/${locale}/gdpr`
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
              <p className="mb-6 text-muted-foreground">{t("intro")}</p>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("controller.title")}
                </h2>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2">
                    <strong>{t("controller.responsible")}</strong>{" "}
                    {t("controller.name")}
                  </p>
                  <p className="mb-2">
                    <strong>{t("controller.email")}</strong>{" "}
                    {t("controller.emailValue")}
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("purposes.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("purposes.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {t
                    .raw("purposes.items")
                    .map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("legalBases.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("legalBases.intro")}
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 font-semibold">
                      {t("legalBases.consent.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("legalBases.consent.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 font-semibold">
                      {t("legalBases.contract.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("legalBases.contract.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 font-semibold">
                      {t("legalBases.legitimate.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("legalBases.legitimate.description")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("rights.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("rights.intro")}
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">
                      {t("rights.access.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rights.access.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">
                      {t("rights.rectification.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rights.rectification.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">
                      {t("rights.erasure.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rights.erasure.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">
                      {t("rights.limitation.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rights.limitation.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">
                      {t("rights.portability.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rights.portability.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">
                      {t("rights.objection.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rights.objection.description")}
                    </p>
                  </div>
                  <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                    <h3 className="mb-2 font-semibold">
                      {t("rights.withdraw.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rights.withdraw.description")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("exercise.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("exercise.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>
                    {t("exercise.email")}{" "}
                    <a
                      href="mailto:dpo@healthincloud.app"
                      className="text-primary hover:underline"
                    >
                      dpo@healthincloud.app
                    </a>
                  </li>
                  <li>{t("exercise.form")}</li>
                </ul>
                <div className="rounded-lg border bg-primary/5 p-6">
                  <p className="mb-2 font-semibold">
                    {t("exercise.responseTime.title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("exercise.responseTime.description")}
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("security.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("security.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {t
                    .raw("security.measures")
                    .map((measure: string, index: number) => (
                      <li key={index}>{measure}</li>
                    ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("transfers.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("transfers.description")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("complaints.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("complaints.intro")}
                </p>
                <div className="rounded-lg border bg-card p-6">
                  <p className="mb-2">
                    <strong>{t("complaints.cnil.name")}</strong>
                  </p>
                  <p className="mb-1 text-sm">
                    {t("complaints.cnil.address1")}
                  </p>
                  <p className="mb-1 text-sm">
                    {t("complaints.cnil.address2")}
                  </p>
                  <p className="mb-1 text-sm">
                    {t("complaints.cnil.address3")}
                  </p>
                  <p className="text-sm">
                    {t("complaints.cnil.website")}{" "}
                    <a
                      href="https://www.cnil.fr"
                      className="text-primary hover:underline"
                    >
                      {t("complaints.cnil.url")}
                    </a>
                  </p>
                </div>
              </section>

              <section className="rounded-lg border bg-primary/5 p-8">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("dpo.title")}
                </h2>
                <p className="mb-2 text-muted-foreground">{t("dpo.intro")}</p>
                <p className="text-muted-foreground">
                  {t("dpo.email")}{" "}
                  <a
                    href="mailto:dpo@healthincloud.app"
                    className="text-primary hover:underline"
                  >
                    dpo@healthincloud.app
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
