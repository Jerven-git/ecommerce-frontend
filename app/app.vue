<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { siteConfig, fetchSiteConfig } = useSiteConfig()
useTheme()

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