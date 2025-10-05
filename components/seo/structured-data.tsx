interface StructuredDataProps {
  data: Record<string, unknown>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function createWebPageSchema(
  name: string,
  description: string,
  url: string,
  locale: string = 'fr'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Health In Cloud',
      url: 'https://healthincloud.app',
    },
  }
}
