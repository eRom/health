import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const title = t('app.title')
  const description = t('app.description')
  const url = 'https://healthincloud.app'

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: [
      'rééducation',
      'orthophonie',
      'neuropsychologie',
      'MPR',
      'Nantes',
      'exercices',
      'cognitive',
      'rehabilitation',
      'speech therapy',
      'neuropsychology',
    ],
    authors: [{ name: 'Health In Cloud' }],
    creator: 'Health In Cloud',
    publisher: 'Health In Cloud',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      url,
      title,
      description,
      siteName: title,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${url}/${locale}`,
      languages: {
        fr: `${url}/fr`,
        en: `${url}/en`,
      },
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    manifest: '/manifest.json',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className="dark">
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
