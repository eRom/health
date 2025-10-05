import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://healthincloud.app'
  const lastModified = new Date()

  const locales = ['fr', 'en']

  // Public pages to include in sitemap
  const publicRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/legal', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/gdpr', priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  // Auth pages (lower priority, indexed but not promoted)
  const authRoutes = [
    { path: '/auth/login', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/auth/signup', priority: 0.5, changeFrequency: 'yearly' as const },
  ]

  const routes = [...publicRoutes, ...authRoutes]

  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const route of routes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            fr: `${baseUrl}/fr${route.path}`,
            en: `${baseUrl}/en${route.path}`,
          },
        },
      })
    }
  }

  return sitemapEntries
}
