import { ThemeStyleScript } from "@/app/theme-style-script";
import { AuthDebugger } from "@/components/debug/auth-debugger";
import { LocaleDebugger } from "@/components/debug/locale-debugger";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { StorageMigration } from "@/components/pwa/storage-migration";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const title = t("app.title");
  const description = t("app.description");
  const url = "https://healthincloud.app";

  return {
    metadataBase: new URL(url),
    applicationName: "Health In Cloud",
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: [
      "rééducation",
      "orthophonie",
      "neuropsychologie",
      "MPR",
      "Nantes",
      "exercices",
      "cognitive",
      "rehabilitation",
      "speech therapy",
      "neuropsychology",
    ],
    authors: [{ name: "Health In Cloud" }],
    creator: "Health In Cloud",
    publisher: "Health In Cloud",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url,
      title,
      description,
      siteName: title,
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
    },
    alternates: {
      languages: {
        fr: `${url}/fr`,
        en: `${url}/en`,
      },
    },
    icons: {
      icon: [
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/apple-icon.png",
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Health In Cloud",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Health In Cloud",
    url: "https://healthincloud.app",
    logo: "https://healthincloud.app/logo.png",
    description:
      locale === "fr"
        ? "Plateforme de rééducation orthophonique et neuropsychologique pour le service MPR de Nantes"
        : "Speech therapy and neuropsychological rehabilitation platform for Nantes MPR department",
    email: "contact@healthincloud.app",
    areaServed: {
      "@type": "City",
      name: "Nantes",
      "@id": "https://www.wikidata.org/wiki/Q12191",
    },
    medicalSpecialty: [
      "Speech-Language Pathology",
      "Neuropsychology",
      "Physical Medicine and Rehabilitation",
    ],
    availableService: [
      {
        "@type": "MedicalTherapy",
        name:
          locale === "fr"
            ? "Rééducation orthophonique"
            : "Speech therapy rehabilitation",
      },
      {
        "@type": "MedicalTherapy",
        name:
          locale === "fr"
            ? "Rééducation neuropsychologique"
            : "Neuropsychological rehabilitation",
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Fira+Code:wght@300..700&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Lora:wght@300..700&family=Merriweather:wght@300;400;700;900&family=Merriweather+Sans:wght@300..800&family=Poppins:wght@100..900&family=Source+Code+Pro:wght@200..900&family=Source+Serif+4:opsz,wght@8..60,200..900&display=swap"
          rel="stylesheet"
        />
        <ThemeStyleScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <meta name="google-site-verification" content="Ot7gKW0uvgQr80-r7kM8j985DTvttOkUz9glo6-gHVw" />
      </head>
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="health-theme"
          >
            {children}
            <Toaster />
            <ServiceWorkerRegistration />
            <PWAInstallPrompt />
            <StorageMigration />
            <LocaleDebugger />
            <AuthDebugger />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
