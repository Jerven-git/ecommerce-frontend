/**
 * Silently redirects visits to pages whose module has been disabled in the
 * admin Modules settings. Admin routes and authenticated admin users are not
 * exempt — option (B) from the original spec: admins see exactly what
 * visitors see. Anything under /admin or /login etc. is not module-gated, so
 * admins can still reach settings to re-enable a module.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only gate public routes. Admin, auth, and API routes are never gated.
  if (
    to.path.startsWith('/admin')
    || to.path === '/login'
    || to.path === '/forgot-password'
    || to.path.startsWith('/reset-password')
    || to.path === '/verify-2fa'
  ) {
    return
  }

  const { siteConfig, fetchSiteConfig } = useSiteConfig()
  // Ensure config is loaded before we decide — matters for the first request
  // (SSR or hard refresh) when the module state hasn't been fetched yet.
  if (!siteConfig.value) {
    await fetchSiteConfig()
  }

  const { isPathEnabled } = useModules()
  if (!isPathEnabled(to.path)) {
    return navigateTo('/', { redirectCode: 302 })
  }
})
