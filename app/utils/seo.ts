const NON_INDEXABLE_PATH_PREFIXES = [
  '/admin',
  '/super-admin',
  '/cart',
  '/checkout',
  '/favorites',
  '/tracking',
  '/order-success',
  '/payment',
  '/backorder/pay',
]

export function isLocalSeoHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase()
  return normalized === 'localhost'
    || normalized.endsWith('.localhost')
    || normalized === '127.0.0.1'
    || normalized === '::1'
}

export function isNonIndexablePath(path: string): boolean {
  return NON_INDEXABLE_PATH_PREFIXES.some(prefix =>
    path === prefix || path.startsWith(`${prefix}/`)
  )
}

export function isSeoIndexingEnabled(value: unknown): boolean {
  return value === true || value === 'true'
}
