<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { $apiFetch } = useNuxtApp()
const faviconUrl = ref('')

useHead({
  link: computed(() =>
    faviconUrl.value
      ? [{ key: 'favicon', rel: 'icon', href: faviconUrl.value }]
      : []
  ),
})

onMounted(async () => {
  try {
    const res = await $apiFetch<{ data: { favicon_url: string } }>('/site-config')
    if (res?.data?.favicon_url) {
      faviconUrl.value = res.data.favicon_url
    }
  } catch {
    // fallback to /favicon.ico
  }
})
</script>