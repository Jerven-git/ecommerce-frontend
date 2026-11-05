<template>
  <div ref="host" class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
  <Suspense :key="documentKey" @resolve="focusWorkspace">
    <AdminWebsitePageEditorWorkspace v-if="selection.kind === 'custom'" ref="workspace" :uuid="selection.uuid" />
    <AdminWebsiteBuiltinEditorWorkspace v-else ref="workspace" />
    <template #fallback><AdminWebsiteEditorLoading /></template>
  </Suspense>
  </div>
</template>

<script setup lang="ts">
import { resolveWebsiteEditorSelection, websiteEditorDocumentKey } from '~/utils/websiteEditorSelection'

definePageMeta({ middleware: 'auth' })
const route = useRoute()
const host = ref<HTMLElement | null>(null)
async function focusWorkspace() { await nextTick(); host.value?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }) }
const workspace = ref<{ canLeave: () => boolean } | null>(null)
const selection = computed(() => resolveWebsiteEditorSelection(route.query))
const documentKey = computed(() => websiteEditorDocumentKey(selection.value))

// Query-only navigation does not invoke route-leave guards. Check the current
// document before a UUID or document-kind change can unmount its workspace.
onBeforeRouteUpdate(to => {
  const nextKey = websiteEditorDocumentKey(resolveWebsiteEditorSelection(to.query))
  return nextKey === documentKey.value || workspace.value?.canLeave() !== false
})
</script>
