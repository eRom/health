/**
 * Utilitaires pour la gestion cohérente des locales
 * Évite les conflits entre Next-Intl, Better Auth et le service worker
 */

import { routing } from '@/i18n/routing'

/**
 * Extrait la locale d'une URL de manière robuste
 */
export function extractLocaleFromPath(pathname: string): 'fr' | 'en' {
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  
  if (firstSegment && routing.locales.includes(firstSegment as 'fr' | 'en')) {
    return firstSegment as 'fr' | 'en'
  }
  
  return routing.defaultLocale
}

/**
 * Construit une URL avec locale préservée
 */
export function buildLocalizedUrl(pathname: string, locale?: 'fr' | 'en'): string {
  const targetLocale = locale || extractLocaleFromPath(pathname)
  
  // Si le pathname commence déjà par une locale, la remplacer
  const pathSegments = pathname.split('/').filter(Boolean)
  if (pathSegments.length > 0 && routing.locales.includes(pathSegments[0] as 'fr' | 'en')) {
    pathSegments[0] = targetLocale
  } else {
    pathSegments.unshift(targetLocale)
  }
  
  return `/${pathSegments.join('/')}`
}

/**
 * Vérifie si une route nécessite une authentification
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    "/dashboard",
    "/neuro",
    "/ortho",
    "/profile",
    "/admin",
  ];
  const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/'
  
  return protectedRoutes.some(route => pathWithoutLocale.startsWith(route))
}

/**
 * Vérifie si une route nécessite des droits d'administrateur
 */
export function isAdminRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/'
  return pathWithoutLocale.startsWith('/admin')
}

/**
 * Logs de débogage pour la locale (à utiliser en développement)
 */
export function debugLocale(context: string, locale: string, pathname?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[LOCALE DEBUG] ${context}:`, {
      locale,
      pathname,
      timestamp: new Date().toISOString()
    })
  }
}
