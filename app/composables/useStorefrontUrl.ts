export function useStorefrontUrl() {
  const authStore = useAuthStore()
  const runtimeConfig = useRuntimeConfig()

  const storeUrl = computed<string>(() => {
    if (!import.meta.client) return '/'

    const store = authStore.user?.store
    const { protocol, port, host: currentHost } = window.location
    const portSuffix = port ? `:${port}` : ''
    const baseDomain = String(runtimeConfig.public.storefrontBaseDomain || 'localhost')

    const host = store?.domain && store.domain_verified
      ? store.domain
      : store?.slug
        ? `${store.slug}.${baseDomain}`
        : currentHost

    return `${protocol}//${host}${portSuffix}`
  })

  return { storeUrl }
}
