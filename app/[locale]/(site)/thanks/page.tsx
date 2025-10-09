import { Footer } from "@/components/navigation/footer";
import { Header } from "@/components/navigation/header";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageThanks" });

  return {
    title: t("title"),
    description: t("hero.message1"),
    openGraph: {
      title: t("title"),
      description: t("hero.message1"),
      images: ["/avatar-romain.jpg"],
    },
  };
}

export default async function ThanksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageThanks" });

  const practitioners = [
    { name: "Anaig", role: "Kinésithérapeute" },
    { name: "Marie", role: "Orthophoniste" },
    { name: "Juliette", role: "Ergothérapeute" },
    { name: "Sophie", role: "APA" },
    { name: "Camille", role: "Psychologue" },
    { name: "Noémie", role: "Assistante sociale" },
    { name: "Pierre", role: "Le sculpteur de mollet" },
    { name: "Denis", role: "Le GPS humain" },
    { name: "Stéphanie", role: "Orthophoniste" },
    { name: "Johanna", role: "Neuropsychologue" },
    { name: "Clarisse", role: "Ergothérapeute" },
    { name: "Gaël", role: "Kinésithérapeute" },
    { name: "Anaïs", role: "Assistante sociale" },
    { name: "Gaelle", role: "Insertion professionnelle" },
    { name: "Tanguy", role: "APA" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="mb-8 relative">
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden ring-4 ring-primary/10 shadow-2xl">
                  <Image
                    src="/avatar-romain.jpg"
                    alt="Avatar"
                    width={160}
                    height={160}
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Message */}
        <section className="py-16">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Card className="border-2">
              <CardContent className="p-8 sm:p-12">
                <blockquote className="space-y-6 text-lg leading-relaxed">
                  <p className="text-foreground/90">{t("hero.message1")}</p>
                  <p className="text-foreground/90 italic">
                    {t("hero.message2")}
                  </p>
                  <p className="text-xl font-medium text-primary flex items-center gap-2">
                    {t("hero.gratitude")}
                  </p>
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Practitioners Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t("practitioners.title")}
            </h2>

            {/* Practitioners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {practitioners.map((practitioner, index) => {
                // Couleurs vives avec bon contraste !
                const colors = [
                  "border-l-8 border-l-blue-600 bg-blue-100 dark:bg-blue-900 shadow-blue-500/30",
                  "border-l-8 border-l-purple-600 bg-purple-100 dark:bg-purple-900 shadow-purple-500/30",
                  "border-l-8 border-l-emerald-600 bg-emerald-100 dark:bg-emerald-900 shadow-emerald-500/30",
                  "border-l-8 border-l-orange-600 bg-orange-100 dark:bg-orange-900 shadow-orange-500/30",
                  "border-l-8 border-l-pink-600 bg-pink-100 dark:bg-pink-900 shadow-pink-500/30",
                  "border-l-8 border-l-cyan-600 bg-cyan-100 dark:bg-cyan-900 shadow-cyan-500/30",
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <Card
                    key={index}
                    className={`hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-rotate-1 ${colorClass}`}
                  >
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-2 dark:text-white text-gray-900">
                        {practitioner.name}
                      </h3>
                      <p className="text-sm font-medium dark:text-gray-100 text-gray-700">
                        {practitioner.role}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Nursing Team Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {t("practitioners.nurses.title")}
                </h3>
                <p className="text-muted-foreground italic">
                  {t("practitioners.nurses.subtitle")}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Motto Section */}
        <section className="py-16">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8 sm:p-12 text-center">
                <blockquote className="text-2xl sm:text-3xl font-serif italic text-foreground mb-8">
                  &ldquo;{t("motto.quote")}&rdquo;
                </blockquote>
                <p className="text-base text-muted-foreground mb-6">
                  {t("closing")}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  — {t("signature")}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
