<template>
  <div>
    <UpdateBanner />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AuthLoginProgress />
    <SuperAdminImpersonationProgress />
    <StorefrontPageLoader />
    <ApexEntryLoader />
  </div>
</template>

<script setup lang="ts">
const { siteConfig, fetchSiteConfig } = useSiteConfig()
const { fetchCatalog: fetchCurrencyCatalog } = useCurrency()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const requestUrl = useRequestURL()
useTheme()

const platformRoutePrefixes = ['/admin', '/super-admin', '/register', '/subscribe']
const platformTitle = computed(() => {
  const isPlatformRoute = platformRoutePrefixes.some(prefix =>
    route.path === prefix || route.path.startsWith(`${prefix}/`),
  )

  return isPlatformRoute ? 'DATABASY' : undefined
})

const crawlerDirective = computed(() => {
  if (!isSeoIndexingEnabled(runtimeConfig.public.seoIndexingEnabled)) {
    return 'noindex,nofollow,noarchive'
  }

  return isNonIndexablePath(route.path)
    ? 'noindex,nofollow,noarchive'
    : undefined
})

useSeoMeta({
  title: () => platformTitle.value,
  ogTitle: () => platformTitle.value,
  twitterTitle: () => platformTitle.value,
  robots: () => crawlerDirective.value,
})

useRealtime({
  onModelChanged(data) {
    if (data.model === 'SiteConfig') {
      fetchSiteConfig(true)
    }
  },
})

useHead({
  link: computed(() => [
    ...(siteConfig.value?.favicon_url
      ? [{ key: 'favicon', rel: 'icon', href: siteConfig.value.favicon_url }]
      : []),
    ...(siteConfig.value?.loader_logo_url
      ? [{ key: 'loader-logo-preload', rel: 'preload', as: 'image', href: siteConfig.value.loader_logo_url }]
      : []),
  ]),
})

useJsonLd('organization', () => {
  if (isNonIndexablePath(route.path)) return null
  const config = siteConfig.value
  if (!config) return null
  return organizationJsonLd(config, seoBaseUrl(config, requestUrl))
})

onMounted(() => {
  fetchSiteConfig()
  fetchCurrencyCatalog()
  useFavoritesStore().load()
})
</script>
