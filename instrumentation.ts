export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.server.config')
  }
}

export async function onRequestError(err: Error, request: Request) {
  const Sentry = await import('@sentry/nextjs')

  Sentry.captureException(err, {
    contexts: {
      nextjs: {
        request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
        },
      },
    },
  })
}
