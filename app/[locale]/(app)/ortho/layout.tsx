import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: 'Exercices Orthophoniques',
    description:
      'Améliorez votre communication avec des exercices de rééducation orthophonique : articulation, phonologie, langage oral, lecture et écriture.',
    keywords: [
      'orthophonie',
      'rééducation du langage',
      'articulation',
      'phonologie',
      'langage oral',
      'lecture',
      'écriture',
      'speech therapy',
      'language rehabilitation',
    ],
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function OrthoLayout({ children }: { children: React.ReactNode }) {
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Exercices Orthophoniques',
    description:
      'Programme d\'exercices de rééducation orthophonique pour améliorer la communication et le langage',
    provider: {
      '@type': 'Organization',
      name: 'Health In Cloud',
      url: 'https://healthincloud.app',
    },
    courseCode: 'ORTHO',
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT15M',
      },
    ],
    educationalLevel: 'Beginner to Advanced',
    teaches: ['Articulation', 'Phonologie', 'Langage oral', 'Lecture', 'Écriture'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {children}
    </>
  )
}
