import type { HomepageSteps } from '~/composables/useSiteConfig'

export const HOW_IT_WORKS_TEXT_FIELDS = [
  { key: 'heading', label: 'Heading size', min: 18, max: 48, default: 28 },
  { key: 'subtitle', label: 'Supporting text size', min: 12, max: 22, default: 15 },
  { key: 'step_title', label: 'Step title size', min: 14, max: 28, default: 17 },
  { key: 'description', label: 'Step description size', min: 12, max: 22, default: 14 },
] as const
export type HowItWorksTextKey = typeof HOW_IT_WORKS_TEXT_FIELDS[number]['key']
export function howItWorksTextSizes(value?: HomepageSteps['typography']) {
  return Object.fromEntries(HOW_IT_WORKS_TEXT_FIELDS.map(field => {
    const size = value?.[field.key]
    return [field.key, typeof size === 'number' && Number.isFinite(size) ? Math.round(Math.max(field.min, Math.min(field.max, size))) : field.default]
  })) as Record<HowItWorksTextKey, number>
}
export function howItWorksDefaultAction(config: { theme_layout?: { id?: string }; modules_enabled?: { contact?: boolean; blog?: boolean } } | null) {
  if (config?.theme_layout?.id === 'service-studio') return config.modules_enabled?.contact === false
    ? { to: '/services', label: 'Explore services' } : { to: '/contact', label: 'Start a conversation' }
  if (config?.theme_layout?.id === 'informational-editorial') return config.modules_enabled?.blog === false
    ? { to: '/about', label: 'Learn more' } : { to: '/blog', label: 'Explore articles' }
  return { to: '/shop', label: 'Start shopping' }
}
export function howItWorksAction(button: HomepageSteps['button'], fallback: { to: string; label: string }) {
  if (button?.enabled === false) return null
  const to = button?.link?.trim() || fallback.to
  if (/[\x00-\x1f\x7f]/.test(to)) return null
  const local = (to.startsWith('/') && !to.startsWith('//') && !to.startsWith('/\\')) || to.startsWith('#')
  let safe = local
  if (!local) {
    try { const url = new URL(to); safe = ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) && Boolean(url.protocol === 'mailto:' || url.protocol === 'tel:' ? url.pathname : url.hostname) } catch { safe = false }
  }
  return safe ? { to, label: button?.label?.trim() || fallback.label } : null
}
