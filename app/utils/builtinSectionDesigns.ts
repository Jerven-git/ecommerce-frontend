import registry from './builtinSectionRegistry.json'
import { websiteSectionDesignStyle, type WebsitePageSectionDesign } from './websitePageDesign'
import type { WebsiteBlockType } from '~/themes/contracts'
import { CONTACT_TEXT_FIELDS, normalizeContactTypography, type ContactTypography } from './contactTypography'

export interface BuiltinSectionDesign { layout?: string; design?: WebsitePageSectionDesign; image_width?: number; typography?: ContactTypography }
export type BuiltinSectionDesignMap = Record<string, Record<string, BuiltinSectionDesign>>
export interface BuiltinSectionDefinition { type: WebsiteBlockType; variants: string[] }
export function builtinSectionDefinition(page: string, section: string): BuiltinSectionDefinition | undefined {
  if (!Object.hasOwn(registry, page)) return undefined
  const sections = (registry as unknown as Record<string, Record<string, BuiltinSectionDefinition>>)[page]!
  return Object.hasOwn(sections, section) ? sections[section] : undefined
}
export function normalizeBuiltinSectionDesigns(value: unknown): BuiltinSectionDesignMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: BuiltinSectionDesignMap = {}
  for (const [page, sections] of Object.entries(value)) {
    if (!sections || typeof sections !== 'object' || Array.isArray(sections)) continue
    for (const [section, config] of Object.entries(sections)) {
      const definition = builtinSectionDefinition(page, section)
      if (!definition || !config || typeof config !== 'object' || Array.isArray(config)) continue
      const next: BuiltinSectionDesign = {}
      const configRecord = config as Record<string, unknown>
      if (page === 'contact' && section === 'contact-content') {
        const typography = normalizeContactTypography(configRecord.typography)
        if (Object.keys(typography).length) next.typography = typography
      }
      if (page === 'about' && section === 'about-content' && typeof configRecord.image_width === 'number' && Number.isFinite(configRecord.image_width)) next.image_width = Math.round(Math.min(100, Math.max(25, configRecord.image_width)))
      if (typeof configRecord.layout === 'string' && definition.variants.includes(configRecord.layout) && configRecord.layout !== 'default') next.layout = configRecord.layout
      const rawDesign = configRecord.design
      const design = rawDesign && typeof rawDesign === 'object' && !Array.isArray(rawDesign) ? rawDesign as Record<string, unknown> : null
      if (design && typeof design === 'object' && !Array.isArray(design)) {
        const safe: WebsitePageSectionDesign = {}
        for (const key of ['background', 'text_color'] as const) if (typeof design[key] === 'string' && /^#[0-9a-f]{6}$/i.test(design[key])) safe[key] = design[key]
        if (typeof design.width === 'string' && ['narrow', 'standard', 'wide', 'full'].includes(design.width)) safe.width = design.width as WebsitePageSectionDesign['width']
        if (typeof design.alignment === 'string' && ['left', 'center', 'right'].includes(design.alignment)) safe.alignment = design.alignment as WebsitePageSectionDesign['alignment']
        for (const key of ['padding_top', 'padding_bottom', 'corner_radius'] as const) if (typeof design[key] === 'number' && Number.isFinite(design[key])) safe[key] = Math.round(Math.min(key === 'corner_radius' ? 48 : 160, Math.max(0, design[key])))
        if (Object.keys(safe).length) next.design = safe
      }
      if (Object.keys(next).length) (result[page] ??= {})[section] = next
    }
  }
  return result
}
export function builtinSectionAttributes(config: { section_designs?: BuiltinSectionDesignMap; theme_layout?: { id?: string } } | null | undefined, page: string, section: string) {
  const setting = normalizeBuiltinSectionDesigns(config?.section_designs)[page]?.[section] ?? {}
  const design = setting.design ?? {}
  const original = websiteSectionDesignStyle(design)
  const style: Record<string, string> = {}
  if (page === 'home' && section === 'newsletter') {
    let foreground = '#ffffff'
    if (design.background) {
      const rgb = design.background.slice(1).match(/../g)!.map(part => {
        const channel = parseInt(part, 16) / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      const luminance = 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!
      foreground = luminance > 0.179 ? '#111827' : '#ffffff'
    }
    style['--newsletter-foreground'] = design.text_color ?? foreground
  }
  if (page === 'contact' && section === 'contact-content') for (const field of CONTACT_TEXT_FIELDS) style[`--contact-${field.key.replaceAll('_', '-')}-size`] = `${setting.typography?.[field.key] ?? field.default}px`
  if (page === 'about' && section === 'about-content') style['--builtin-story-image-width'] = `${setting.image_width ?? 70}%`
  for (const [key, value] of Object.entries(original)) {
    if (key === 'padding-top') style['--builtin-padding-top'] = value
    else if (key === 'padding-bottom') style['--builtin-padding-bottom'] = value
    else if (key === 'background-color') style['--builtin-background'] = value
    else if (key === 'border-radius') style['--builtin-radius'] = value
    else style[key] = value
  }
  return {
    class: 'builtin-section', style,
    'data-builtin-page': page, 'data-builtin-section': section,
    'data-builtin-theme': config?.theme_layout?.id ?? 'classic',
    'data-builtin-layout': setting.layout ?? 'default',
    'data-builtin-alignment': design.alignment ?? 'default',
    'data-design-background': Boolean(design.background), 'data-design-text': Boolean(design.text_color),
    'data-design-width': Boolean(design.width), 'data-design-alignment': Boolean(design.alignment),
    'data-design-top': design.padding_top != null, 'data-design-bottom': design.padding_bottom != null,
    'data-design-radius': design.corner_radius != null,
  }
}
