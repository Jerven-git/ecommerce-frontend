import type { WebsitePageBlock } from '~/types/websitePage'

export interface WebsitePageSectionDesign {
  background?: string | null
  text_color?: string | null
  alignment?: 'left' | 'center' | 'right' | null
  width?: 'narrow' | 'standard' | 'wide' | 'full' | null
  padding_top?: number | null
  padding_bottom?: number | null
  corner_radius?: number | null
}

const color = (value: unknown) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : undefined
const pixels = (value: unknown, max: number) => typeof value === 'number' && Number.isFinite(value) ? `${Math.round(Math.min(max, Math.max(0, value)))}px` : undefined

export function websitePageSectionStyle(block: WebsitePageBlock): Record<string, string> {
  return websiteSectionDesignStyle(block.settings.design ?? {})
}

export function websiteSectionDesignStyle(design: WebsitePageSectionDesign = {}): Record<string, string> {
  const widths = { narrow: '42rem', standard: '64rem', wide: '80rem', full: 'none' }
  const alignment = ['left', 'center', 'right'].includes(design.alignment ?? '') ? design.alignment! : undefined
  return Object.fromEntries(Object.entries({
    'background-color': color(design.background),
    '--section-text': color(design.text_color),
    color: color(design.text_color),
    '--section-align': alignment,
    '--section-items': alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : alignment === 'center' ? 'center' : undefined,
    '--section-width': design.width && Object.hasOwn(widths, design.width) ? widths[design.width] : undefined,
    'padding-top': pixels(design.padding_top, 160),
    'padding-bottom': pixels(design.padding_bottom, 160),
    'border-radius': pixels(design.corner_radius, 48),
  }).filter((entry): entry is [string, string] => entry[1] !== undefined))
}
