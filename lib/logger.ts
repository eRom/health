import * as Sentry from '@sentry/nextjs'

/**
 * Centralized logging utility with Sentry integration
 * Use this instead of console.log/error/warn in production code
 */

type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal'

interface LogContext {
  [key: string]: unknown
}

/**
 * Log a message with context to Sentry
 */
export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
): void {
  // Always log to console in development
  if (process.env.NODE_ENV !== 'production') {
    const logFn =
      level === 'error' || level === 'fatal'
        ? console.error
        : level === 'warning'
          ? console.warn
          : console.log

    logFn(`[${level.toUpperCase()}] ${message}`, context || '')
    return
  }

  // In production, send to Sentry (only warnings and above)
  if (level === 'warning' || level === 'error' || level === 'fatal') {
    Sentry.captureMessage(message, {
      level: level === 'warning' ? 'warning' : 'error',
      contexts: context ? { extra: context } : undefined,
    })
  }
}

/**
 * Log an error to Sentry
 */
export function logError(
  error: Error | unknown,
  message?: string,
  context?: LogContext
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message || 'Error:', error, context || '')
    return
  }

  if (error instanceof Error) {
    Sentry.captureException(error, {
      contexts: context ? { extra: { ...context, message } } : undefined,
    })
  } else {
    Sentry.captureMessage(
      message || 'Unknown error occurred',
      {
        level: 'error',
        contexts: { extra: { error, ...context } },
      }
    )
  }
}

/**
 * Convenience methods
 */
export const logger = {
  debug: (message: string, context?: LogContext) =>
    log('debug', message, context),
  info: (message: string, context?: LogContext) =>
    log('info', message, context),
  warn: (message: string, context?: LogContext) =>
    log('warning', message, context),
  error: (error: Error | unknown, message?: string, context?: LogContext) =>
    logError(error, message, context),
}
