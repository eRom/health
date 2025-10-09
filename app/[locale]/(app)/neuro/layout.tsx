import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = "https://healthincloud.app";

  return {
    title: "Exercices Neuropsychologiques",
    description:
      "Entraînez vos capacités cognitives avec des exercices de neuropsychologie ciblés : mémoire, attention, fonctions exécutives et capacités visuo-spatiales.",
    keywords: [
      "neuropsychologie",
      "exercices cognitifs",
      "mémoire",
      "attention",
      "fonctions exécutives",
      "rééducation cognitive",
      "neuropsychological exercises",
      "cognitive training",
    ],
    alternates: {
      canonical: `${url}/${locale}/neuro`,
      languages: {
        fr: `${url}/fr/neuro`,
        en: `${url}/en/neuro`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function NeuroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Exercices Neuropsychologiques",
    description:
      "Programme d'exercices de rééducation neuropsychologique pour améliorer les capacités cognitives",
    provider: {
      "@type": "Organization",
      name: "Health In Cloud",
      url: "https://healthincloud.app",
    },
    courseCode: "NEURO",
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT15M",
      },
    ],
    educationalLevel: "Beginner to Advanced",
    teaches: [
      "Mémoire de travail",
      "Attention sélective",
      "Fonctions exécutives",
      "Capacités visuo-spatiales",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {children}
    </>
  );
}
