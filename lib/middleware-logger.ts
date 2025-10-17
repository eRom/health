/**
 * Lightweight logger for Edge middleware
 * Does NOT use Sentry to avoid bundle size issues
 */

interface LogContext {
  [key: string]: unknown
}

/**
 * Simple console-based logger for middleware
 * Logs are sent to Vercel Edge Logs automatically
 */
export const middlewareLogger = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, context || '')
    }
  },

  info: (message: string, context?: LogContext) => {
    console.log(`[INFO] ${message}`, context || '')
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context || '')
  },

  error: (error: Error | unknown, message?: string, context?: LogContext) => {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message || error.message}`, {
        error: error.message,
        stack: error.stack,
        ...context,
      })
    } else {
      console.error(`[ERROR] ${message || 'Unknown error'}`, { error, ...context })
    }
  },
}
