export interface TenantRenderCacheIdentity {
  host: string | null | undefined
  locale: string | null | undefined
  path: string
  query?: Record<string, string | number | boolean | null | undefined | Array<string | number | boolean | null>>
  publishedReleaseId: string | null | undefined
  themeId: string | null | undefined
  themeVersion: string | null | undefined
}

function normalizeHost(host: string): string {
  const normalized = host.trim().toLowerCase().replace(/\.$/, '')

  if (normalized.startsWith('[')) {
    const closingBracket = normalized.indexOf(']')
    return closingBracket >= 0 ? normalized.slice(0, closingBracket + 1) : normalized
  }

  return normalized.replace(/:\d+$/, '')
}

function normalizePath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || '/'
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`

  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash
}

function queryValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item ?? '')).sort()
  }

  if (value === undefined) return []

  return [String(value ?? '')]
}

function normalizeQuery(query: Record<string, unknown> = {}): string {
  const params = new URLSearchParams()

  for (const key of Object.keys(query).sort()) {
    for (const value of queryValues(query[key])) {
      params.append(key, value)
    }
  }

  return params.toString()
}

/**
 * Returns a deterministic identity only when every tenant/version boundary is
 * present. Runtime HTML caching remains disabled in Phase 4; future cache code
 * must refuse to cache when this function returns null.
 */
export function buildTenantRenderCacheKey(input: TenantRenderCacheIdentity): string | null {
  const host = input.host ? normalizeHost(input.host) : ''
  const locale = input.locale?.trim().toLowerCase() ?? ''
  const release = input.publishedReleaseId?.trim() ?? ''
  const themeId = input.themeId?.trim().toLowerCase() ?? ''
  const themeVersion = input.themeVersion?.trim() ?? ''

  if (!host || !locale || !release || !themeId || !themeVersion) return null

  const identity = {
    host,
    locale,
    path: normalizePath(input.path),
    query: normalizeQuery(input.query),
    release,
    theme: `${themeId}@${themeVersion}`,
  }

  return `ssu-render:v1:${JSON.stringify(identity)}`
}
