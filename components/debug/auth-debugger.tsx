'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { logger } from '@/lib/logger'

/**
 * Composant de débogage pour les cookies et la session Better Auth
 * À utiliser uniquement en développement
 */
export function AuthDebugger() {
  const [session, setSession] = useState<unknown>(null)
  const [cookies, setCookies] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Récupérer les cookies
    setCookies(document.cookie)

    // Récupérer la session
    authClient
      .getSession()
      .then(setSession)
      .catch((error) => logger.error(error, '[AUTH DEBUG] getSession failed'))
  }, [])

  // Ne s'affiche qu'en développement
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const refreshSession = async () => {
    try {
      const newSession = await authClient.getSession()
      setSession(newSession)
      setCookies(document.cookie)
      logger.debug('[AUTH DEBUG] Session refreshed', { session: newSession })
    } catch (error) {
      logger.error(error, '[AUTH DEBUG] Error refreshing session')
    }
  }

  const testLogin = async () => {
    try {
      logger.debug('[AUTH DEBUG] Testing login')
      const response = await authClient.signIn.email({
        email: 'test@example.com',
        password: 'testpassword'
      })
      logger.debug('[AUTH DEBUG] Test login response', { response })
    } catch (error) {
      logger.error(error, '[AUTH DEBUG] Test login error')
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white px-3 py-2 rounded text-sm font-mono shadow-lg"
      >
        Auth Debug {isVisible ? '▼' : '▲'}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-white border rounded-lg shadow-lg p-4 min-w-96 max-w-lg">
          <div className="space-y-3 text-sm font-mono">
            <div>
              <strong>Session:</strong>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            <div>
              <strong>Cookies:</strong>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                {cookies || 'No cookies'}
              </pre>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={refreshSession}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                Refresh Session
              </button>
              <button
                onClick={testLogin}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                Test Login
              </button>
            </div>
            
            <div>
              <button
                onClick={() => {
                  logger.debug('Current auth state', {
                    session,
                    cookies: document.cookie,
                    timestamp: new Date().toISOString()
                  })
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs"
              >
                Log State to Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
