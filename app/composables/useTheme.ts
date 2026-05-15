import { useSiteConfig, DEFAULT_THEME, DEFAULT_IN_STOCK_COLOR } from './useSiteConfig'
import { generatePalette } from '~/utils/color'

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
  aboutImage: string
  blogImage: string
  servicesImage: string
  contactImage: string
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
    heroImage: '/images/OceanBlue/window.webp',
    heroMediaMime: 'image/webp',
    aboutImage: '/images/OceanBlue/ocean-about.webp',
    blogImage: '/images/OceanBlue/ocean-blog.webp',
    servicesImage: '/images/OceanBlue/ocean-services.webp',
    contactImage: '/images/OceanBlue/ocean-contact.webp',
  },
  {
    name: 'Forest Green',
    primary: '#4CAF50',
    secondary: '#2E7D32',
    accent: '#ECFDF5',
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
    texture: 'dots',
    heroImage: '/images/ForestGreen/food.webp',
    heroMediaMime: 'image/webp',
    aboutImage: '/images/ForestGreen/forest-about.webp',
    blogImage: '/images/ForestGreen/forest-blog.webp',
    servicesImage: '/images/ForestGreen/forest-services.webp',
    contactImage: '/images/ForestGreen/forest-contact.webp',
  },
  {
    name: 'Warm Sunset',
    primary: '#FF7043',
    secondary: '#BF360C',
    accent: '#FFF7ED',
    headingFont: 'Poppins',
    bodyFont: 'Lato',
    texture: 'none',
    heroImage: '/images/WarmSunset/wedding.webp',
    heroMediaMime: 'image/webp',
    aboutImage: '/images/WarmSunset/sunset-about.webp',
    blogImage: '/images/WarmSunset/sunset-blog.webp',
    servicesImage: '/images/WarmSunset/sunset-services.webp',
    contactImage: '/images/WarmSunset/sunset-contact.webp',
  },
  {
    name: 'Soft Lavender',
    primary: '#9575CD',
    secondary: '#4527A0',
    accent: '#F5F3FF',
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    texture: 'dots',
    heroImage: '/images/SoftLavender/woman.webp',
    heroMediaMime: 'image/webp',
    aboutImage: '/images/SoftLavender/lavender-about.webp',
    blogImage: '/images/SoftLavender/lavender-blog.webp',
    servicesImage: '/images/SoftLavender/lavender-services.webp',
    contactImage: '/images/SoftLavender/lavender-contact.webp',
  },
  {
    name: 'Arte Gallery',
    primary: '#C8A45C',
    secondary: '#1A1A1A',
    accent: '#FAF7F0',
    headingFont: 'Playfair Display',
    bodyFont: 'Lora',
    texture: 'none',
    heroImage: '/images/ArteGallery/mountain-art.webp',
    heroMediaMime: 'image/webp',
    aboutImage: '/images/ArteGallery/gallery-about.webp',
    blogImage: '/images/ArteGallery/gallery-blog.webp',
    servicesImage: '/images/ArteGallery/gallery-services.webp',
    contactImage: '/images/ArteGallery/gallery-contact.webp',
  },
  {
    name: 'Minimal Mono',
    primary: '#424242',
    secondary: '#212121',
    accent: '#F5F5F5',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    texture: 'grid',
    heroImage: '/images/MinimalMono/laptop.webp',
    heroMediaMime: 'image/webp',
    aboutImage: '/images/MinimalMono/mono-about.webp',
    blogImage: '/images/MinimalMono/mono-blog.webp',
    servicesImage: '/images/MinimalMono/mono-services.webp',
    contactImage: '/images/MinimalMono/mono-contact.webp',
  },
]

export function useTheme() {
  const { siteConfig } = useSiteConfig()

  function applyTheme() {
    if (!import.meta.client) return

    const config = siteConfig.value
    const theme = config?.theme ?? DEFAULT_THEME
    const primary = theme.primary_color || DEFAULT_THEME.primary_color
    const secondary = theme.secondary_color || DEFAULT_THEME.secondary_color
    const accent = theme.accent_color || DEFAULT_THEME.accent_color

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

    // Badge colors
    const badgeInStockColor = config?.badge_in_stock_color || DEFAULT_IN_STOCK_COLOR
    root.setProperty('--color-badge-in-stock', badgeInStockColor)

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
