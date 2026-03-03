import { useSiteConfig } from './useSiteConfig'

/**
 * Converts a hex color string to HSL components.
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return { h, s, l }
}

/**
 * Converts HSL components to a hex color string.
 */
function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Generates a Tailwind-like shade palette (50–950) from a single base hex color.
 * The base color maps to the 600 shade.
 */
function generatePalette(baseHex: string): Record<string, string> {
  const { h, s } = hexToHSL(baseHex)

  // Target lightness values for each shade (Tailwind-style distribution)
  const shades: Record<string, number> = {
    '50': 0.95,
    '100': 0.90,
    '200': 0.82,
    '300': 0.71,
    '400': 0.62,
    '500': 0.53,
    '600': 0.45,
    '700': 0.38,
    '800': 0.30,
    '900': 0.24,
    '950': 0.17,
  }

  const palette: Record<string, string> = {}
  for (const [shade, lightness] of Object.entries(shades)) {
    // Slightly reduce saturation for very light and very dark shades
    let adjS = s
    if (lightness > 0.85) adjS = Math.max(s * 0.6, 0)
    else if (lightness < 0.2) adjS = Math.max(s * 0.7, 0)

    palette[shade] = hslToHex(h, adjS, lightness)
  }

  return palette
}

// Fonts available for selection
export const AVAILABLE_FONTS = [
  'Inter',
  'Poppins',
  'Playfair Display',
  'Roboto',
  'Lato',
  'Montserrat',
  'Open Sans',
  'Merriweather',
]

let fontLinkEl: HTMLLinkElement | null = null

function loadGoogleFonts(fonts: string[]) {
  const unique = [...new Set(fonts.filter(f => f && f !== 'Inter'))]
  if (unique.length === 0) {
    if (fontLinkEl) {
      fontLinkEl.remove()
      fontLinkEl = null
    }
    return
  }

  const families = unique.map(f => f.replace(/ /g, '+')).join('&family=')
  const href = `https://fonts.googleapis.com/css2?family=${families}:wght@300;400;500;600;700&display=swap`

  if (!fontLinkEl) {
    fontLinkEl = document.createElement('link')
    fontLinkEl.rel = 'stylesheet'
    document.head.appendChild(fontLinkEl)
  }
  fontLinkEl.href = href
}

export function useTheme() {
  const { siteConfig } = useSiteConfig()

  function applyTheme() {
    if (!import.meta.client) return

    const config = siteConfig.value
    const primary = config?.primary_color || '#6898ED'
    const secondary = config?.secondary_color || '#4B5979'

    const root = document.documentElement.style

    // Generate and apply primary palette
    const primaryPalette = generatePalette(primary)
    for (const [shade, color] of Object.entries(primaryPalette)) {
      root.setProperty(`--color-primary-${shade}`, color)
    }
    root.setProperty('--color-primary', String(primaryPalette['600']))

    // Generate and apply secondary palette
    const secondaryPalette = generatePalette(secondary)
    for (const [shade, color] of Object.entries(secondaryPalette)) {
      root.setProperty(`--color-secondary-${shade}`, color)
    }
    root.setProperty('--color-secondary', String(secondaryPalette['600']))

    // Fonts
    const headingFont = config?.heading_font || 'Inter'
    const bodyFont = config?.body_font || 'Inter'
    root.setProperty('--font-heading', `'${headingFont}', sans-serif`)
    root.setProperty('--font-body', `'${bodyFont}', sans-serif`)

    loadGoogleFonts([headingFont, bodyFont])
  }

  // Watch for siteConfig changes and re-apply
  watch(siteConfig, () => {
    applyTheme()
  }, { immediate: true })

  return { applyTheme }
}
