<template>
  <div :class="{ 'ssu-marketing-home': isApexMarketing }">
    <div v-if="siteConfigPending && !siteConfig" class="min-h-[60vh] flex items-center justify-center">
      <span class="text-sm text-gray-500">Loading…</span>
    </div>
    <ApexHomepage v-else-if="isApexMarketing" />
    <StorefrontHomepage v-else />
  </div>
</template>

<script setup lang="ts">
const { siteConfig, pending: siteConfigPending } = useSiteConfig()
const isApexMarketing = computed(() => siteConfig.value?.is_storefront_host === false)
const apexBrandName = computed(() => isApexMarketing.value ? 'DATABASY' : undefined)

useStaticPageSeo('home', undefined, {
  title: apexBrandName,
  siteName: apexBrandName,
})
</script>
