<template>
  <StorefrontPageWebsitePageRenderer
    v-if="page"
    :title="page.title"
    :document="page.document"
    :media="page.media"
    :collections="page.collections"
  />
</template>

<script setup lang="ts">
import { useWebsitePages } from '~/composables/useWebsitePages'

const route = useRoute()
const { siteConfig } = useSiteConfig()
const { resolve } = useWebsitePages()
const path = computed(() => route.path)
const locale = computed(() => siteConfig.value?.locale || siteConfig.value?.default_locale || 'en')
const { data, error } = await useAsyncData(
  () => `website-page:${path.value}:${locale.value}`,
  () => resolve(path.value, locale.value),
  { watch: [path, locale] },
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const page = computed(() => data.value?.data ?? null)

useSeoMeta({
  title: () => page.value?.document.seo.title || page.value?.title || '',
  description: () => page.value?.document.seo.description || '',
  robots: () => page.value?.document.seo.noindex ? 'noindex, nofollow' : 'index, follow',
  ogImage: () => {
    const mediaId = page.value?.document.seo.og_image_media_id
    return mediaId ? page.value?.media[mediaId]?.url : undefined
  },
})
</script>
