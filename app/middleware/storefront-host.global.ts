/**
 * On the bare apex — or any host not bound to a store — there is no storefront
 * to render (`is_storefront_host === false`), so visitors are sent to the admin
 * login. Custom domains (nazareck.com) and store subdomains (acme.localhost)
 * resolve a store and render their storefront normally.
 *
 * Admin and super-admin routes are host-agnostic (login must work from any
 * host), so they are never redirected — this also prevents a redirect loop
 * since the login itself lives under /admin.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin') || to.path.startsWith('/super-admin')) {
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
})
