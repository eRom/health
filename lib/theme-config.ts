import type { ThemeStyleConfig } from "@/types/theme";

/**
 * Available theme styles configuration
 *
 * Each style provides a complete design system including:
 * - Color palette (semantic tokens)
 * - Typography (font families)
 * - Spacing & radius
 * - Shadows
 * - Color swatches for visual preview
 */
export const THEME_STYLES_CONFIG: ThemeStyleConfig[] = [
  {
    value: "default",
    label: "Default",
    description:
      "Design moderne et épuré avec polices Merriweather, ombres douces et palette équilibrée",
    colors: {
      light: ["#509553", "#F5F5F5", "#E8E8E8", "#A7A9A9"],
      dark: ["#509553", "#262828", "#1F2121", "#626C71"],
    },
  },
  {
    value: "amber",
    label: "Amber Minimal",
    description:
      "Style chaleureux avec accents orange/ambre, polices Inter/Source Serif, et contraste élevé",
    colors: {
      light: ["#F59E0B", "#FFFFFF", "#F5F5F5", "#9CA3AF"],
      dark: ["#F59E0B", "#1F2937", "#111827", "#6B7280"],
    },
  },
  {
    value: "perpetuity",
    label: "Perpetuity",
    description:
      "Design futuriste avec police monospace, palette cyan/bleu, et ombres minimalistes",
    colors: {
      light: ["#0EA5E9", "#E0F2FE", "#BAE6FD", "#7DD3FC"],
      dark: ["#06B6D4", "#164E63", "#0E7490", "#155E75"],
    },
  },
  {
    value: "notebook",
    label: "Notebook",
    description:
      "Style carnet manuscrit avec police Architects Daughter, tons neutres et ombres subtiles",
    colors: {
      light: ["#7C7C7C", "#FAFAFA", "#E9E9E9", "#D9D9D9"],
      dark: ["#C2C2C2", "#525252", "#424242", "#6D6D6D"],
    },
  },
  {
    value: "bubblegum",
    label: "Bubblegum",
    description:
      "Style coloré et moderne avec polices Poppins/Lora, palette rose/magenta et ombres géométriques",
    colors: {
      light: ["#E91E63", "#F8BBD9", "#FCE4EC", "#F3E5F5"],
      dark: ["#FF4081", "#2C1810", "#1A0E0A", "#3D2317"],
    },
  },
  {
    value: "healthincloud",
    label: "Health In Cloud",
    description:
      "Design professionnel santé avec polices Inter/Playfair, palette violette/rose et ombres élégantes",
    colors: {
      light: ["#7B3FF2", "#F5E6FF", "#E5D3F5", "#D4ADFC"],
      dark: ["#6D2FD9", "#33204D", "#2D1A42", "#4A316B"],
    },
  },
];

export const DEFAULT_THEME_STYLE = "default";
export const THEME_STYLE_STORAGE_KEY = "health-theme-style";
