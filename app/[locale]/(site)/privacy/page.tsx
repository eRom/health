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
  const t = await getTranslations({ locale, namespace: "pagePrivacy" });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pagePrivacy" });

  type Bullet = { title: string; description: string };
  type Processor = {
    name: string;
    description: string;
    dpaLabel: string;
    dpaUrl: string;
    safeguards?: string;
  };

  const rawDataCollected = t.raw("dataCollected.items");
  const dataCollectedItems = Array.isArray(rawDataCollected)
    ? (rawDataCollected as Bullet[])
    : [];

  const rawLegalBasis = t.raw("legalBasis.items");
  const legalBasisItems = Array.isArray(rawLegalBasis)
    ? (rawLegalBasis as Bullet[])
    : [];

  const rawDataSharing = t.raw("dataSharing.items");
  const dataSharingItems = Array.isArray(rawDataSharing)
    ? (rawDataSharing as Processor[])
    : [];

  const rawTransferSafeguards = t.raw("transferSafeguards.items");
  const transferSafeguardsItems = Array.isArray(rawTransferSafeguards)
    ? (rawTransferSafeguards as string[])
    : [];

  const schema = createWebPageSchema(
    t("title"),
    t("metadata.description"),
    `https://healthincloud.app/${locale}/privacy`
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
              <p className="mb-6 text-sm text-muted-foreground">
                {t("lastUpdated")}
              </p>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("introduction.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("introduction.description")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("dataCollected.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("dataCollected.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {dataCollectedItems.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong> {item.description}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("dataUsage.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("dataUsage.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {t
                    .raw("dataUsage.items")
                    .map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("legalBasis.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("legalBasis.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {legalBasisItems.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong> {item.description}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("dataSharing.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("dataSharing.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-3 text-muted-foreground">
                  {dataSharingItems.map((item) => (
                    <li key={item.name}>
                      <strong>{item.name}</strong> {item.description}{" "}
                      <a
                        href={item.dpaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {item.dpaLabel}
                      </a>
                      {item.safeguards ? ` — ${item.safeguards}` : null}
                    </li>
                  ))}
                </ul>
                <p className="mb-4 text-muted-foreground">
                  {t("dataSharing.noSale")}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("transferSafeguards.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("transferSafeguards.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {transferSafeguardsItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("dataSecurity.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("dataSecurity.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {t
                    .raw("dataSecurity.measures")
                    .map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("dataRetention.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("dataRetention.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  {t
                    .raw("dataRetention.items")
                    .map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("userRights.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("userRights.intro")}
                </p>
                <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>
                    <strong>{t("userRights.access.title")}</strong>{" "}
                    {t("userRights.access.description")}
                  </li>
                  <li>
                    <strong>{t("userRights.rectification.title")}</strong>{" "}
                    {t("userRights.rectification.description")}
                  </li>
                  <li>
                    <strong>{t("userRights.erasure.title")}</strong>{" "}
                    {t("userRights.erasure.description")}
                  </li>
                  <li>
                    <strong>{t("userRights.limitation.title")}</strong>{" "}
                    {t("userRights.limitation.description")}
                  </li>
                  <li>
                    <strong>{t("userRights.portability.title")}</strong>{" "}
                    {t("userRights.portability.description")}
                  </li>
                  <li>
                    <strong>{t("userRights.objection.title")}</strong>{" "}
                    {t("userRights.objection.description")}
                  </li>
                </ul>
                <p className="mb-4 text-muted-foreground">
                  {t("userRights.contact")}{" "}
                  <a
                    href="mailto:dpo@healthincloud.app"
                    className="text-primary hover:underline"
                  >
                    dpo@healthincloud.app
                  </a>
                </p>
              </section>

              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">
                  {t("cookies.title")}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t("cookies.description")}
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
