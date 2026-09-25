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
 * since the login itself lives under /admin. The public /register and
 * /subscribe self-onboarding pages are host-agnostic for the same reason.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (
    to.path.startsWith('/admin') ||
    to.path.startsWith('/super-admin') ||
    to.path === '/register' ||
    to.path.startsWith('/subscribe')
  ) {
    return
  }

  // Bare apex (e.g. `localhost`, prod base domain) is the public marketing
  // site. Only `/`, `/register`, `/subscribe` and `/admin`/`/super-admin`
  // are valid there — everything else is a store route that doesn't exist
  // on apex, so bounce those back to `/`. This keeps `/` as the SaaS
  // front door while still supporting per-store subdomains / custom domains
  // for real storefronts. The check is purely client-side host-based so it
  // works even when `/site-config` hasn't loaded yet.
  const baseDomain = String(useRuntimeConfig().public.storefrontBaseDomain || '').toLowerCase()
  const requestUrl = useRequestURL()
  const host = requestUrl.hostname.toLowerCase()
  const isApex = !!baseDomain && (host === baseDomain || host === `www.${baseDomain}`)
  if (isApex) {
    const allowedApexPrefixes = ['/admin', '/super-admin', '/register', '/subscribe']
    const isAllowedApex = to.path === '/' || allowedApexPrefixes.some((p) => to.path === p || to.path.startsWith(p + '/'))
    if (!isAllowedApex) {
      // Let the marketing page handle its own anchors (/ #features etc) — don't
      // redirect hash navigations away. Only bounce unknown storefront paths.
      return navigateTo('/', { redirectCode: 302 })
    }
    // Apex marketing homepage is valid — don't fall through to the
    // `is_storefront_host===false` login redirect below.
    return
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
