'use client'

import { useEffect, useState } from 'react'
import type { ThemeStyle } from '@/types/theme'
import {
  DEFAULT_THEME_STYLE,
  THEME_STYLE_STORAGE_KEY,
} from '@/lib/theme-config'
import { THEME_STYLES } from '@/types/theme'

/**
 * Hook to manage theme style (independent from light/dark mode)
 *
 * This hook manages the visual style of the theme (default, amber, perpetuity)
 * by applying a data-style attribute on the document element.
 *
 * Features:
 * - Persists style preference to localStorage
 * - Syncs across browser tabs
 * - Avoids hydration mismatch with mounted state
 * - Validates style values
 */
export function useThemeStyle(initialStyle?: ThemeStyle) {
  const [style, setStyleState] = useState<ThemeStyle>(DEFAULT_THEME_STYLE)
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true)

    // Priority: initialStyle (from DB) > localStorage > default
    const stored = localStorage.getItem(THEME_STYLE_STORAGE_KEY) as ThemeStyle
    const validStored = stored && THEME_STYLES.includes(stored) ? stored : null
    const initial = initialStyle || validStored || DEFAULT_THEME_STYLE

    setStyleState(initial)

    // Apply to document immediately
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-style', initial)
    }
  }, [initialStyle])

  // Sync localStorage and document when style changes
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem(THEME_STYLE_STORAGE_KEY, style)

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-style', style)
    }
  }, [style, mounted])

  // Listen for storage events (sync across tabs)
  useEffect(() => {
    if (!mounted) return

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STYLE_STORAGE_KEY && e.newValue) {
        const newStyle = e.newValue as ThemeStyle
        if (THEME_STYLES.includes(newStyle)) {
          setStyleState(newStyle)
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [mounted])

  const setStyle = (newStyle: ThemeStyle) => {
    if (!THEME_STYLES.includes(newStyle)) {
      console.warn(`Invalid theme style: ${newStyle}. Using default.`)
      return
    }
    setStyleState(newStyle)
  }

  return {
    style: mounted ? style : DEFAULT_THEME_STYLE,
    setStyle,
    mounted,
  }
}
