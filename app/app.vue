<template>
  <div>
    <UpdateBanner />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { siteConfig, fetchSiteConfig } = useSiteConfig()
const { fetchCatalog: fetchCurrencyCatalog } = useCurrency()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const requestUrl = useRequestURL()
useTheme()

const crawlerDirective = computed(() => {
  if (!isSeoIndexingEnabled(runtimeConfig.public.seoIndexingEnabled)) {
    return 'noindex,nofollow,noarchive'
  }

  return isNonIndexablePath(route.path)
    ? 'noindex,nofollow,noarchive'
    : undefined
})

useSeoMeta({
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
  link: computed(() =>
    siteConfig.value?.favicon_url
      ? [{ key: 'favicon', rel: 'icon', href: siteConfig.value.favicon_url }]
      : []
  ),
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
