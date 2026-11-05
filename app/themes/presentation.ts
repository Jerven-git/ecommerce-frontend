import type { WebsiteNavigationItem } from '~/composables/useSiteConfig'

export interface ThemeNavigationLink {
  id: string
  label: string
  to: string
}

function normalizedThemePath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || '/'
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  return withLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
}

export function themeRouteLabel(path: string, homeLabel: string): string {
  const normalized = normalizedThemePath(path)
  if (normalized === '/') return homeLabel

  const segment = normalized.split('/').filter(Boolean)[0] ?? homeLabel
  let decoded = segment
  try {
    decoded = decodeURIComponent(segment)
  } catch {
    // Keep the original segment when a malformed public URL cannot be decoded.
  }

  return decoded
    .replace(/-/g, ' ')
    .replace(/\b\p{L}/gu, letter => letter.toLocaleUpperCase())
}

export function themeNavigationLinks(
  navigation: readonly WebsiteNavigationItem[] | null | undefined,
  limit = 8,
): ThemeNavigationLink[] {
  if (!navigation || limit <= 0) return []

  return navigation
    .filter(item => item.visible
      && item.kind === 'link'
      && typeof item.value === 'string'
      && item.value.startsWith('/')
      && item.label.trim().length > 0)
    .slice(0, limit)
    .map(item => ({
      id: item.id,
      label: item.label.trim(),
      to: item.value as string,
    }))
}

export function isThemeRouteActive(currentPath: string, targetPath: string): boolean {
  const current = normalizedThemePath(currentPath)
  const target = normalizedThemePath(targetPath)
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}
