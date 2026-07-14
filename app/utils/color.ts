/**
 * Converts a hex color string to HSL components.
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
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
export function hslToHex(h: number, s: number, l: number): string {
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
export function generatePalette(baseHex: string): Record<string, string> {
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

/**
 * Pick the text colour (near-white or near-black) that reads best on top of a
 * given solid background, using the WCAG relative-luminance contrast formula.
 * Used to keep themed buttons/bands legible whatever a store's brand colour is
 * (e.g. white-on-gold fails; this returns near-black for a light gold instead).
 */
export function readableOn(hex: string): string {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  if (full.length !== 6) return '#ffffff'

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const r = toLinear(parseInt(full.slice(0, 2), 16) / 255)
  const g = toLinear(parseInt(full.slice(2, 4), 16) / 255)
  const b = toLinear(parseInt(full.slice(4, 6), 16) / 255)
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b

  const contrastWhite = 1.05 / (L + 0.05)
  const contrastBlack = (L + 0.05) / 0.05
  return contrastWhite >= contrastBlack ? '#ffffff' : '#141414'
}
