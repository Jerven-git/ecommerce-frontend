import { useSiteConfig, DEFAULT_THEME } from './useSiteConfig'

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

  // Target lightness values for each shade (Tailwind-style distribution).
  // 50 lowered slightly from 0.95 so highly saturated base colours still
  // read as a visible tint instead of collapsing to near-white.
  const shades: Record<string, number> = {
    '50': 0.93,
    '100': 0.88,
    '200': 0.80,
    '300': 0.70,
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
    // Keep most of the saturation at the extremes so the tint stays
    // recognisable for highly saturated base colours (e.g. pink/magenta).
    // Previously the light-shade dampening was s*0.6 which washed the
    // sidebar active state out to near-white on vivid palettes.
    let adjS = s
    if (lightness > 0.85) adjS = Math.max(s * 0.85, 0)
    else if (lightness < 0.2) adjS = Math.max(s * 0.9, 0)

    palette[shade] = hslToHex(h, adjS, lightness)
  }

  return palette
}

// Fonts available for selection. Any font added here must also be declared in
// `fonts.families` in nuxt.config.ts so @nuxt/fonts self-hosts it.
export const AVAILABLE_FONTS = [
  // Sans-serif (UI / general)
  'Inter',
  'Poppins',
  'Roboto',
  'Lato',
  'Montserrat',
  'Open Sans',
  'Nunito',
  'Work Sans',
  'DM Sans',
  'Raleway',
  'Fira Sans',
  // Serif (editorial / premium)
  'Playfair Display',
  'Merriweather',
  'Lora',
  'Crimson Pro',
  'Libre Baskerville',
  // Display / headings
  'Bebas Neue',
  'Oswald',
  'Archivo Black',
  'Space Grotesk',
]

// Available texture patterns (CSS-only, no images)
export interface TextureOption {
  id: string
  name: string
  css: string // CSS background value
}

export const AVAILABLE_TEXTURES: TextureOption[] = [
  { id: 'none', name: 'None', css: 'none' },
  {
    id: 'dots',
    name: 'Dots',
    css: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
  },
  {
    id: 'grid',
    name: 'Grid',
    css: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
  },
  {
    id: 'diagonal',
    name: 'Diagonal Lines',
    css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
  },
  {
    id: 'cross',
    name: 'Crosshatch',
    css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
  },
  {
    id: 'waves',
    name: 'Waves',
    css: 'radial-gradient(ellipse at 50% 0%, transparent 60%, currentColor 61%, transparent 62%), radial-gradient(ellipse at 50% 100%, transparent 60%, currentColor 61%, transparent 62%)',
  },
  {
    id: 'polka',
    name: 'Polka',
    css: 'radial-gradient(circle, currentColor 3px, transparent 3px)',
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    css: 'linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%), linear-gradient(315deg, currentColor 25%, transparent 25%), linear-gradient(45deg, currentColor 25%, transparent 25%)',
  },
  {
    id: 'stripes',
    name: 'Stripes',
    css: 'repeating-linear-gradient(0deg, transparent, transparent 5px, currentColor 5px, currentColor 6px)',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    css: 'linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(-45deg, currentColor 25%, transparent 25%), linear-gradient(45deg, transparent 75%, currentColor 75%), linear-gradient(-45deg, transparent 75%, currentColor 75%)',
  },
]

// Complete theme presets
export interface ThemePreset {
  name: string
  primary: string
  secondary: string
  accent: string
  headingFont: string
  bodyFont: string
  texture: string
  heroImage: string
  heroMediaMime: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Ocean Blue',
    primary: '#6898ED',
    secondary: '#4B5979',
    accent: '#EEF2FF',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    texture: 'none',
    heroImage: '/images/window.webp',
    heroMediaMime: 'image/webp',
  },
  {
    name: 'Forest Green',
    primary: '#4CAF50',
    secondary: '#2E7D32',
    accent: '#ECFDF5',
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
    texture: 'dots',
    heroImage: '/images/food.webp',
    heroMediaMime: 'image/webp',
  },
  {
    name: 'Warm Sunset',
    primary: '#FF7043',
    secondary: '#BF360C',
    accent: '#FFF7ED',
    headingFont: 'Poppins',
    bodyFont: 'Lato',
    texture: 'none',
    heroImage: '/images/wedding.webp',
    heroMediaMime: 'image/webp',
  },
  {
    name: 'Soft Lavender',
    primary: '#9575CD',
    secondary: '#4527A0',
    accent: '#F5F3FF',
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    texture: 'dots',
    heroImage: '/images/woman.webp',
    heroMediaMime: 'image/webp',
  },
  {
    name: 'Minimal Mono',
    primary: '#424242',
    secondary: '#212121',
    accent: '#F5F5F5',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    texture: 'grid',
    heroImage: '/images/laptop.webp',
    heroMediaMime: 'image/webp',
  },
]

export function useTheme() {
  const { siteConfig } = useSiteConfig()

  function applyTheme() {
    if (!import.meta.client) return

    const config = siteConfig.value
    const theme = config?.theme ?? DEFAULT_THEME
    const primary = theme.primary_color || '#6898ED'
    const secondary = theme.secondary_color || '#4B5979'
    const accent = theme.accent_color || '#F3F4F6'

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

    // Accent / surface color
    root.setProperty('--color-accent', accent)

    // Texture
    const textureId = theme.texture || 'none'
    const texture = AVAILABLE_TEXTURES.find(t => t.id === textureId)
    if (texture && texture.id !== 'none') {
      root.setProperty('--texture-pattern', texture.css)
      // Texture sizing per pattern
      const sizeMap: Record<string, string> = {
        dots: '20px 20px',
        grid: '20px 20px',
        diagonal: 'auto',
        cross: 'auto',
        waves: '40px 20px',
        polka: '30px 30px',
        zigzag: '20px 20px',
        stripes: 'auto',
        diamond: '24px 24px',
      }
      root.setProperty('--texture-size', sizeMap[texture.id] || 'auto')
    } else {
      root.setProperty('--texture-pattern', 'none')
      root.setProperty('--texture-size', 'auto')
    }

    // Fonts — @nuxt/fonts self-hosts all AVAILABLE_FONTS at build time, so we
    // only need to swap the CSS variables here.
    const headingFont = theme.heading_font || 'Inter'
    const bodyFont = theme.body_font || 'Inter'
    root.setProperty('--font-heading', `'${headingFont}', sans-serif`)
    root.setProperty('--font-body', `'${bodyFont}', sans-serif`)
  }

  // Watch for siteConfig changes and re-apply
  watch(siteConfig, () => {
    applyTheme()
  }, { immediate: true })

  return { applyTheme }
}
