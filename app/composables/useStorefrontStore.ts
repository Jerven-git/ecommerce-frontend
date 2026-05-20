/**
 * Resolves the current store from the request hostname (subdomain-per-store).
 *
 * `acme.localhost`  -> slug "acme"
 * `acme.yoursite.com` (base "yoursite.com") -> slug "acme"
 * `localhost` / apex domain -> null (the default store)
 *
 * This mirrors the backend's ResolveStorefrontStore middleware, which is the
 * source of truth — it resolves the store from the Host header on every API
 * call. This composable exists only for components that need to know the slug
 * client-side (links, labels, analytics), not for data scoping.
 *
 * Uses useRequestURL() so it works during SSR (request host) and on the client
 * (window.location) without branching.
 */
export function useStorefrontStore() {
  const config = useRuntimeConfig()
  const baseDomain = ((config.public.storefrontBaseDomain as string) || 'localhost').toLowerCase()

  const url = useRequestURL()
  const hostname = url.hostname.toLowerCase()

  const storeSlug = extractStoreSlug(hostname, baseDomain)

  return {
    /** Store slug from the subdomain, or null when on the apex/base domain. */
    storeSlug,
    /** True when there is no store subdomain (visitor is on the default store). */
    isDefaultStore: storeSlug === null,
    hostname,
  }
}

/**
 * Strip the base domain off the hostname to get the store slug, or null if the
 * host is the base domain itself or doesn't sit under it.
 */
function extractStoreSlug(hostname: string, baseDomain: string): string | null {
  if (!baseDomain || hostname === baseDomain) {
    return null
  }

  const suffix = '.' + baseDomain
  if (!hostname.endsWith(suffix)) {
    return null
  }

  const slug = hostname.slice(0, -suffix.length)
  return slug === '' ? null : slug
}
