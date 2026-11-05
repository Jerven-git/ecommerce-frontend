export type SiteConfigContext = 'public' | 'admin'

const ADMIN_GUEST_PATHS = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/verify-2fa',
])

export function siteConfigContextForPath(path: string): SiteConfigContext {
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path
  const isAdminPath = normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')

  return isAdminPath && !ADMIN_GUEST_PATHS.has(normalizedPath) ? 'admin' : 'public'
}

export function siteConfigEndpoint(context: SiteConfigContext): string {
  return context === 'admin' ? '/admin/site-config' : '/site-config'
}

export function siteConfigStateKey(context: SiteConfigContext, hostname: string): string {
  const normalizedHost = hostname.trim().toLowerCase() || 'unknown-host'

  return `siteConfig:${context}:${normalizedHost}`
}
