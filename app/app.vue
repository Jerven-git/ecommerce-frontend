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
useTheme()

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

onMounted(() => {
  fetchSiteConfig()
  useFavoritesStore().load()
})
</script>