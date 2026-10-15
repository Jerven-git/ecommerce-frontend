<template>
  <section class="rounded-2xl bg-emerald-50 px-5 py-4 text-emerald-950">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <Icon name="heroicons:paint-brush" class="h-5 w-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <h2 class="text-sm font-semibold">{{ title }}</h2>
          <p class="mt-1 max-w-2xl text-xs leading-5 text-emerald-800">{{ description }}</p>
        </div>
      </div>

      <NuxtLink
        :to="editorTo"
        class="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        data-website-editor-entry
        @pointerenter="warmEditor"
        @focus="warmEditor"
        @touchstart.passive="warmEditor"
      >
        Open Website Editor
        <Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" aria-hidden="true" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description: string
  editorTo?: string | Record<string, unknown>
}>(), {
  title: 'This content is managed in Website Editor',
  editorTo: '/admin/website-editor',
})

const { fetchSiteConfig } = useSiteConfig()
const { preloadDraft } = useWebsiteEditorDraft()
let warmRequest: Promise<void> | null = null

function warmEditor() {
  if (!import.meta.client || warmRequest) return warmRequest
  warmRequest = Promise.allSettled([
    preloadRouteComponents('/admin/website-editor'),
    fetchSiteConfig(),
    preloadDraft(),
  ]).then(() => undefined).finally(() => {
    warmRequest = null
  })
  return warmRequest
}
</script>
