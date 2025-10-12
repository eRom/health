import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offline" });

  return {
    title: t("title"),
    description: t("description"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offline" });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.svg"
            alt="Health In Cloud"
            width={96}
            height={96}
            className="h-24 w-24 text-primary"
            style={{
              filter: "brightness(0) saturate(100%)",
            }}
          />
        </div>

        {/* WiFi Off Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <WifiOff className="h-16 w-16 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight">{t("title")}</h1>

        {/* Description */}
        <p className="mb-8 text-lg text-muted-foreground">{t("description")}</p>

        {/* Instructions */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {t("instructions.title")}
          </h2>
          <ol className="space-y-2 text-left text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2 font-bold text-primary">1.</span>
              <span>{t("instructions.step1")}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold text-primary">2.</span>
              <span>{t("instructions.step2")}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold text-primary">3.</span>
              <span>{t("instructions.step3")}</span>
            </li>
          </ol>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
