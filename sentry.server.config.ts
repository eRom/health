import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',

  enabled: process.env.NODE_ENV === 'production',

  beforeSend(event) {
    // Filter out console.log noise in production
    if (event.level === 'log' || event.level === 'info') {
      return null
    }

    // Add extra context for server errors
    if (event.request) {
      event.tags = {
        ...event.tags,
        'server-side': true,
      }
    }

    return event
  },
})
