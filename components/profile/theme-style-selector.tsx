'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { updatePreferences } from '@/app/actions/update-preferences'
import { toast } from 'sonner'
import { useThemeStyle } from '@/hooks/use-theme-style'
import { THEME_STYLES_CONFIG } from '@/lib/theme-config'
import type { ThemeStyle } from '@/types/theme'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ThemeStyleSelectorProps {
  initialStyle?: ThemeStyle
}

export function ThemeStyleSelector({ initialStyle }: ThemeStyleSelectorProps) {
  const { style, setStyle, mounted } = useThemeStyle(initialStyle)
  const { resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  async function handleStyleChange(newStyle: string) {
    const themeStyle = newStyle as ThemeStyle
    if (themeStyle === style) return

    setIsLoading(true)

    // Update style immediately (localStorage + UI)
    setStyle(themeStyle)

    // Update preference in database
    const result = await updatePreferences({ themeStyle })

    if (result.success) {
      toast.success('Style mis à jour avec succès')
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour')
      // Revert style on error
      setStyle(style)
    }

    setIsLoading(false)
  }

  if (!mounted) {
    return null
  }

  const currentStyleConfig = THEME_STYLES_CONFIG.find((s) => s.value === style)
  const isDark = resolvedTheme === 'dark'

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-muted-foreground">Style</p>
      <Select
        value={style}
        onValueChange={handleStyleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {currentStyleConfig && (
              <div className="flex items-center gap-3">
                {/* Color swatches */}
                <div className="flex gap-1">
                  {(isDark
                    ? currentStyleConfig.colors.dark
                    : currentStyleConfig.colors.light
                  ).map((color, index) => (
                    <div
                      key={index}
                      className="h-4 w-4 rounded-full border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span>{currentStyleConfig.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {THEME_STYLES_CONFIG.map((styleOption) => {
            const colors = isDark
              ? styleOption.colors.dark
              : styleOption.colors.light

            return (
              <SelectItem key={styleOption.value} value={styleOption.value}>
                <div className="flex items-center gap-3">
                  {/* Color swatches */}
                  <div className="flex gap-1">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="h-4 w-4 rounded-full border border-border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{styleOption.label}</span>
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
