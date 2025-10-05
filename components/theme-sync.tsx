'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export function ThemeSync({
  serverTheme,
  children,
}: {
  serverTheme: string | null
  children: React.ReactNode
}) {
  const { theme, setTheme } = useTheme()
  const hasSynced = useRef(false)

  useEffect(() => {
    // Only sync once on mount if no theme is set in localStorage
    if (!hasSynced.current && serverTheme && !theme) {
      setTheme(serverTheme)
      hasSynced.current = true
    }
  }, [serverTheme, theme, setTheme])

  return <>{children}</>
}
