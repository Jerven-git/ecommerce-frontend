import type { H3Event } from 'h3'

export interface TenantSeoConfig {
  site_name?: string | null
  canonical_base_url?: string | null
  logo_url?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  social_links?: Array<{ url?: string | null }> | null
  modules_enabled?: Partial<Record<'shop' | 'blog' | 'services' | 'about' | 'contact', boolean>> | null
  pages_seo?: Record<string, { noindex?: boolean | null }> | null
}

export interface SitemapEntity {
  slug: string
  updated_at?: string | null
  noindex?: boolean | null
  is_active?: boolean
  is_published?: boolean
}

interface PaginatedResponse<T> {
  data?: T[]
  current_page?: number
  last_page?: number
}

function requestTenantHeaders(event: H3Event): Record<string, string> {
  const incoming = getRequestHeaders(event)
  const host = incoming['x-forwarded-host'] || incoming.host
  const proto = incoming['x-forwarded-proto']

  return {
    accept: 'application/json',
    ...(host ? { host, 'x-forwarded-host': host } : {}),
    ...(proto ? { 'x-forwarded-proto': proto } : {}),
  }
}

function apiRoot(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const base = String(config.apiBase || getRequestURL(event).origin).replace(/\/$/, '')
  const path = String(config.public.apiPath || '/api/v1')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export async function fetchTenantApi<T>(
  event: H3Event,
  path: string,
  query?: Record<string, string | number | boolean>,
): Promise<T> {
  return await $fetch<T>(`${apiRoot(event)}${path}`, {
    query,
    headers: requestTenantHeaders(event),
  })
}

export async function fetchAllTenantEntities<T extends SitemapEntity>(
  event: H3Event,
  path: string,
  query: Record<string, string | number | boolean> = {},
): Promise<T[]> {
  const entities: T[] = []
  let page = 1
  let lastPage = 1

  do {
    const response = await fetchTenantApi<PaginatedResponse<T>>(event, path, {
      ...query,
      per_page: 100,
      page,
    })

    entities.push(...(response.data ?? []))
    lastPage = Math.max(1, Number(response.last_page ?? response.current_page ?? 1))
    page += 1
  } while (page <= lastPage && page <= 1000)

  return entities
}

export function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return host === 'localhost'
    || host.endsWith('.localhost')
    || host === '127.0.0.1'
    || host === '::1'
}

export function tenantBaseUrl(event: H3Event, config: TenantSeoConfig): string {
  const requestUrl = getRequestURL(event)
  const configured = config.canonical_base_url?.trim()

  if (!isLocalHostname(requestUrl.hostname) && configured) {
    return configured.replace(/\/$/, '')
  }

  return requestUrl.origin.replace(/\/$/, '')
}

export function indexingEnabled(event: H3Event): boolean {
  const value = useRuntimeConfig(event).public.seoIndexingEnabled
  return value === true || value === 'true'
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

