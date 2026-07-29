/**
 * On the bare apex — or any host not bound to a store — there is no storefront
 * to render, so visitors are sent to the admin login. The apex is detected two
 * ways: a fast client-side check of the browser host against the configured
 * base domain (so `localhost` always lands on login even when the backend is
 * unreachable), and the backend's `is_storefront_host === false` for any other
 * unbound host. Custom domains (nazareck.com) and store subdomains
 * (acme.localhost) resolve a store and render their storefront normally.
 *
 * Admin and super-admin routes are host-agnostic (login must work from any
 * host), so they are never redirected — this also prevents a redirect loop
 * since the login itself lives under /admin.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin') || to.path.startsWith('/super-admin')) {
    return
  }

  // Hard guard for the bare apex (e.g. `localhost`, or the production base
  // domain with no subdomain). Decide purely from the browser host so this
  // holds even if the `/site-config` fetch fails and falls back to defaults
  // (which assume a storefront host). A store subdomain (`acme.localhost`) or a
  // custom store domain (`nazareck.com`) is never the bare base domain, so
  // those skip this and resolve their storefront via the backend below.
  const baseDomain = String(useRuntimeConfig().public.storefrontBaseDomain || '').toLowerCase()
  const requestUrl = useRequestURL()
  const host = requestUrl.hostname.toLowerCase()
  if (baseDomain) {
    if (host === baseDomain || host === `www.${baseDomain}`) {
      return navigateTo('/admin/login', { redirectCode: 302 })
    }
  }

  const { siteConfig, fetchSiteConfig } = useSiteConfig()
  // Ensure config is loaded before deciding — matters on the first navigation
  // (hard refresh) before app.vue's onMounted fetch has run.
  if (!siteConfig.value) {
    await fetchSiteConfig()
  }

  if (siteConfig.value?.is_storefront_host === false) {
    return navigateTo('/admin/login')
  }

  // Fallback canonical redirect. Production nginx issues a real 301 before the
  // SPA ever loads (see nginx/conf.d/production.conf), so this only fires in
  // environments not fronted by that config. Compare hostnames, not hosts, so a
  // dev port never causes a redirect loop.
  const canonicalHost = siteConfig.value?.canonical_host
  if (canonicalHost && host !== canonicalHost && !isLocalSeoHost(host)) {
    return navigateTo(`${requestUrl.protocol}//${canonicalHost}${to.fullPath}`, {
      external: true,
      redirectCode: 301,
    })
  }
})
