/**
 * Theme system types
 *
 * The theme system has two independent dimensions:
 * - Mode: light | dark | system (managed by next-themes)
 * - Style: default | amber | perpetuity | notebook (managed by custom hook)
 */

export const THEME_STYLES = [
  "default",
  "amber",
  "perpetuity",
  "notebook",
  "bubblegum",
  "healthincloud",
] as const;

export type ThemeStyle = (typeof THEME_STYLES)[number]

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeStyleConfig {
  value: ThemeStyle
  label: string
  description: string
  colors: {
    light: string[]
    dark: string[]
  }
}

export interface ThemePreferences {
  mode: ThemeMode
  style: ThemeStyle
}
