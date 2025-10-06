import type { NextConfig } from "next"
import createNextIntlPlugin from 'next-intl/plugin'
import withBundleAnalyzer from '@next/bundle-analyzer'
import withSerwistInit from '@serwist/next'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },
}

export default withSerwist(bundleAnalyzer(withNextIntl(nextConfig)))
