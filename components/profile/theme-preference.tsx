'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { updatePreferences } from '@/app/actions/update-preferences'
import { toast } from 'sonner'

const themes = [
  { value: 'light', label: 'Clair', icon: '☀️' },
  { value: 'dark', label: 'Sombre', icon: '🌙' },
  { value: 'system', label: 'Système', icon: '💻' },
] as const

export function ThemePreference() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
    if (newTheme === theme) return

    setIsLoading(true)

    // Update theme immediately (localStorage + UI)
    setTheme(newTheme)

    // Update preference in database
    const result = await updatePreferences({ theme: newTheme })

    if (result.success) {
      toast.success('Thème mis à jour avec succès')
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour')
      // Revert theme on error
      setTheme(theme || 'system')
    }

    setIsLoading(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-muted-foreground">Thème</p>
      <div className="flex flex-wrap gap-2">
        {themes.map((themeOption) => {
          const isActive = theme === themeOption.value
          return (
            <Button
              key={themeOption.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={isActive ? 'gap-2 text-white hover:text-white' : 'gap-2'}
              onClick={() => handleThemeChange(themeOption.value)}
              disabled={isLoading || isActive}
            >
              <span>{themeOption.icon}</span>
              <span>{themeOption.label}</span>
              {isActive && <span className="text-xs">✓</span>}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
