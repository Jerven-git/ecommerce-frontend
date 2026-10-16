<template>
  <BaseModal
    :open="open"
    title="Media library"
    :subtitle="`Choose an asset for ${slotLabel}`"
    size="3xl"
    body-class="p-0"
    @close="$emit('close')"
  >
    <div class="flex min-h-[34rem] flex-col">
      <div class="flex flex-col gap-2 border-b border-admin-border p-3 sm:flex-row sm:items-center">
        <label class="relative min-w-0 flex-1">
          <span class="sr-only">Search media</span>
          <Icon name="heroicons:magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
          <input
            v-model="search"
            type="search"
            class="min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface py-2 pl-9 pr-3 text-base text-admin-text outline-none placeholder:text-admin-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent sm:text-xs"
            placeholder="Search file names or descriptions"
            autocomplete="off"
          />
        </label>
        <div class="flex items-center rounded-xl border border-admin-border bg-admin-soft p-1" role="group" aria-label="Media type">
          <button
            v-for="option in typeOptions"
            :key="option.id"
            type="button"
            class="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent sm:flex-none"
            :class="mediaType === option.id ? 'bg-admin-surface text-admin-accent-strong shadow-[var(--admin-shadow-quiet)]' : 'text-admin-muted hover:text-admin-text'"
            :aria-pressed="mediaType === option.id"
            @click="mediaType = option.id"
          >
            <Icon :name="option.icon" class="h-3.5 w-3.5" aria-hidden="true" />
            {{ option.label }}
          </button>
        </div>
      </div>

      <div v-if="error" class="flex items-center gap-3 border-b border-admin-danger/20 bg-admin-danger-soft px-4 py-2.5 text-xs text-admin-danger" role="alert">
        <Icon name="heroicons:exclamation-triangle" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <p class="min-w-0 flex-1">{{ error }}</p>
        <button type="button" class="min-h-11 rounded-lg px-2 font-semibold hover:bg-admin-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-danger" @click="loadAssets">Try again</button>
      </div>

      <div class="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_17rem]">
        <div class="min-h-0 border-admin-border md:border-r">
          <div v-if="loading" class="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3" role="status" aria-label="Loading media library">
            <div v-for="index in 6" :key="index" class="overflow-hidden rounded-xl border border-admin-border">
              <div class="aspect-[4/3] animate-pulse bg-admin-soft motion-reduce:animate-none" />
              <div class="space-y-2 p-2.5"><div class="h-3 w-3/4 animate-pulse rounded bg-admin-soft motion-reduce:animate-none" /><div class="h-3 w-1/2 animate-pulse rounded bg-admin-soft motion-reduce:animate-none" /></div>
            </div>
          </div>

          <div v-else-if="!assets.length" class="flex min-h-72 items-center justify-center px-6 text-center">
            <div class="max-w-xs">
              <Icon name="heroicons:photo" class="mx-auto h-6 w-6 text-admin-muted" aria-hidden="true" />
              <p class="mt-3 text-sm font-semibold text-admin-text">{{ search ? 'No matching media' : 'No reusable media yet' }}</p>
              <p class="mt-1 text-xs leading-5 text-admin-muted">{{ search ? 'Try a different file name or media type.' : 'Upload an asset from the editor. Replaced files will remain available here when safe.' }}</p>
            </div>
          </div>

          <div v-else class="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
            <button
              v-for="asset in assets"
              :key="asset.id"
              type="button"
              class="group min-w-0 overflow-hidden rounded-xl border bg-admin-surface text-left transition-colors hover:border-admin-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
              :class="selectedId === asset.id ? 'border-admin-accent' : 'border-admin-border'"
              :aria-pressed="selectedId === asset.id"
              :aria-label="`Review ${asset.name}`"
              @click="selectAsset(asset)"
            >
              <span class="relative block aspect-[4/3] overflow-hidden bg-admin-soft">
                <video v-if="asset.mime_type.startsWith('video/')" :src="asset.url" class="h-full w-full object-cover" muted preload="metadata" />
                <img v-else :src="asset.url" alt="" class="h-full w-full object-cover" loading="lazy" />
                <span class="absolute left-2 top-2 rounded-md bg-admin-surface/95 px-1.5 py-0.5 text-[11px] font-semibold" :class="statusClass(asset.status)">{{ statusLabel(asset.status) }}</span>
                <span v-if="currentId === asset.id" class="absolute bottom-2 right-2 rounded-md bg-admin-accent px-1.5 py-0.5 text-[11px] font-semibold text-admin-on-accent">Current</span>
              </span>
              <span class="block p-2.5">
                <span class="block truncate text-xs font-semibold text-admin-text">{{ asset.name }}</span>
                <span class="mt-0.5 block text-[11px] text-admin-muted">{{ formatBytes(asset.size) }} · {{ mediaKind(asset) }}</span>
              </span>
            </button>
          </div>

          <div v-if="meta.last_page > 1" class="flex items-center justify-between border-t border-admin-border px-3 py-2 text-xs text-admin-muted">
            <button type="button" class="min-h-11 rounded-lg px-3 font-semibold hover:bg-admin-soft disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :disabled="meta.current_page <= 1 || loading" @click="changePage(meta.current_page - 1)">Previous</button>
            <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
            <button type="button" class="min-h-11 rounded-lg px-3 font-semibold hover:bg-admin-soft disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :disabled="meta.current_page >= meta.last_page || loading" @click="changePage(meta.current_page + 1)">Next</button>
          </div>
        </div>

        <aside class="border-t border-admin-border p-4 md:border-t-0" aria-label="Selected media details">
          <div v-if="selectedAsset" class="space-y-4">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-admin-text">{{ selectedAsset.name }}</p>
              <p class="mt-1 text-xs text-admin-muted">{{ formatBytes(selectedAsset.size) }} · {{ mediaKind(selectedAsset) }}</p>
            </div>

            <div class="space-y-3">
              <label class="block">
                <span class="text-xs font-semibold text-admin-text">File name</span>
                <input v-model="metadataName" maxlength="255" class="mt-1 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent sm:text-xs" />
              </label>
              <label class="block">
                <span class="text-xs font-semibold text-admin-text">Media description</span>
                <textarea v-model="metadataAlt" maxlength="255" rows="3" class="mt-1 min-h-24 w-full resize-y rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent sm:text-xs" placeholder="Describe the image for accessibility" />
              </label>
              <button type="button" class="min-h-11 w-full rounded-xl border border-admin-border px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :disabled="savingMetadata || !metadataChanged" @click="saveMetadata">
                {{ savingMetadata ? 'Saving details…' : 'Save details' }}
              </button>
            </div>

            <div v-if="selectedAsset.usage.length" class="border-t border-admin-border pt-4">
              <p class="text-xs font-semibold text-admin-text">Used by</p>
              <ul class="mt-2 space-y-1 text-xs text-admin-muted">
                <li v-for="usage in selectedAsset.usage" :key="usage" class="flex items-start gap-1.5">
                  <Icon name="heroicons:link" class="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {{ usage }}
                </li>
              </ul>
            </div>

            <div class="space-y-2 border-t border-admin-border pt-4">
              <button type="button" class="min-h-11 w-full rounded-xl bg-admin-accent px-3 text-xs font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:cursor-wait disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent" :disabled="usingAsset" @click="useSelectedAsset">
                {{ usingAsset ? 'Adding to draft…' : currentId === selectedAsset.id ? 'Keep this asset' : 'Use this asset' }}
              </button>

              <template v-if="deleteConfirm">
                <p class="text-xs leading-5 text-admin-danger">Delete this archived file permanently?</p>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" class="min-h-11 rounded-xl border border-admin-border text-xs font-semibold text-admin-text hover:bg-admin-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :disabled="deletingAsset" @click="deleteConfirm = false">Cancel</button>
                  <button type="button" class="min-h-11 rounded-xl bg-admin-danger px-2 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-danger" :disabled="deletingAsset" @click="deleteSelectedAsset">{{ deletingAsset ? 'Deleting…' : 'Delete' }}</button>
                </div>
              </template>
              <button v-else-if="selectedAsset.can_delete && currentId !== selectedAsset.id" type="button" class="min-h-11 w-full rounded-xl px-3 text-xs font-semibold text-admin-danger hover:bg-admin-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-danger" @click="deleteConfirm = true">Delete archived asset</button>
              <p v-else class="text-xs leading-5 text-admin-muted">{{ deleteHelp }}</p>
            </div>
          </div>

          <div v-else class="flex min-h-40 items-center justify-center text-center text-xs leading-5 text-admin-muted">
            Select an asset to review its details and usage.
          </div>
        </aside>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { WebsiteEditorAssetSlot, WebsiteEditorAssetUpload } from '~/composables/useWebsiteEditorDraft'
import type { WebsiteEditorMediaAsset } from '~/composables/useWebsiteEditorMediaLibrary'

const props = defineProps<{
  open: boolean
  slot: WebsiteEditorAssetSlot
  currentId: number | null
}>()

const emit = defineEmits<{
  close: []
  selected: [asset: WebsiteEditorAssetUpload]
}>()

const { fetchAssets, reuseAsset, updateAsset, deleteAsset } = useWebsiteEditorMediaLibrary()
const assets = ref<WebsiteEditorMediaAsset[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const mediaType = ref<'all' | 'image' | 'video'>('all')
const selectedId = ref<number | null>(null)
const metadataName = ref('')
const metadataAlt = ref('')
const savingMetadata = ref(false)
const usingAsset = ref(false)
const deletingAsset = ref(false)
const deleteConfirm = ref(false)
const meta = reactive({ current_page: 1, last_page: 1, per_page: 12, total: 0 })
let requestSequence = 0
let searchTimer: number | null = null

const slotLabels: Record<WebsiteEditorAssetSlot, string> = {
  logo: 'the header logo', favicon: 'the browser icon', cart_icon: 'the cart icon', footer_logo: 'the footer logo',
  hero: 'the home hero', homepage_statement: 'the statement image', about: 'the About cover',
  story_image_a: 'Story section 1', story_image_b: 'Story section 2', contact: 'the Contact cover',
  blog: 'the Blog cover', services: 'the Services cover',
}
const slotLabel = computed(() => slotLabels[props.slot])
const typeOptions = computed(() => [
  { id: 'all' as const, label: 'All', icon: 'heroicons:squares-2x2' },
  { id: 'image' as const, label: 'Images', icon: 'heroicons:photo' },
  ...(props.slot === 'hero' ? [{ id: 'video' as const, label: 'Videos', icon: 'heroicons:video-camera' }] : []),
])
const selectedAsset = computed(() => assets.value.find(asset => asset.id === selectedId.value) ?? null)
const metadataChanged = computed(() => Boolean(selectedAsset.value) && (
  metadataName.value.trim() !== selectedAsset.value!.name
  || metadataAlt.value.trim() !== (selectedAsset.value!.alt_text ?? '')
))
const deleteHelp = computed(() => {
  if (!selectedAsset.value) return ''
  if (props.currentId === selectedAsset.value.id) return 'This asset is selected in the current draft.'
  if (selectedAsset.value.usage.length) return 'Remove its website and version-history references before deleting it.'
  if (selectedAsset.value.status !== 'archived') return 'Live and private-draft assets are protected from direct deletion.'
  return ''
})

watch(() => props.open, open => {
  if (!open) return
  search.value = ''
  mediaType.value = 'all'
  selectedId.value = props.currentId
  meta.current_page = 1
  void loadAssets()
})

watch(() => props.slot, () => {
  if (!props.open) return
  mediaType.value = 'all'
  selectedId.value = props.currentId
  meta.current_page = 1
  void loadAssets()
})

watch([search, mediaType], () => {
  if (!props.open) return
  meta.current_page = 1
  if (searchTimer !== null) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(loadAssets, 250)
})

watch(selectedAsset, asset => {
  metadataName.value = asset?.name ?? ''
  metadataAlt.value = asset?.alt_text ?? ''
  deleteConfirm.value = false
  error.value = ''
})

onBeforeUnmount(() => {
  if (searchTimer !== null) window.clearTimeout(searchTimer)
})

async function loadAssets() {
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''
  try {
    const response = await fetchAssets({
      slot: props.slot,
      type: mediaType.value,
      search: search.value.trim() || undefined,
      page: meta.current_page,
    })
    if (sequence !== requestSequence) return
    assets.value = response.data
    Object.assign(meta, response.meta)
    if (selectedId.value && !assets.value.some(asset => asset.id === selectedId.value)) selectedId.value = null
  } catch (reason: any) {
    if (sequence !== requestSequence) return
    error.value = apiMessage(reason, 'The media library could not be loaded.')
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

function selectAsset(asset: WebsiteEditorMediaAsset) {
  selectedId.value = asset.id
}

function changePage(page: number) {
  meta.current_page = page
  void loadAssets()
}

async function useSelectedAsset() {
  if (!selectedAsset.value || usingAsset.value) return
  usingAsset.value = true
  error.value = ''
  try {
    const result = await reuseAsset(selectedAsset.value.id, props.slot)
    emit('selected', result)
    emit('close')
  } catch (reason: any) {
    error.value = apiMessage(reason, 'This asset could not be added to the draft.')
  } finally {
    usingAsset.value = false
  }
}

async function saveMetadata() {
  if (!selectedAsset.value || !metadataChanged.value || savingMetadata.value) return
  savingMetadata.value = true
  error.value = ''
  try {
    const response = await updateAsset(selectedAsset.value.id, {
      original_name: metadataName.value.trim(),
      alt_text: metadataAlt.value.trim(),
    })
    const index = assets.value.findIndex(asset => asset.id === response.data.id)
    if (index >= 0) assets.value[index] = response.data
  } catch (reason: any) {
    error.value = apiMessage(reason, 'The media details could not be saved.')
  } finally {
    savingMetadata.value = false
  }
}

async function deleteSelectedAsset() {
  if (!selectedAsset.value?.can_delete || deletingAsset.value) return
  deletingAsset.value = true
  error.value = ''
  try {
    await deleteAsset(selectedAsset.value.id)
    selectedId.value = null
    deleteConfirm.value = false
    await loadAssets()
  } catch (reason: any) {
    error.value = apiMessage(reason, 'This asset could not be deleted.')
  } finally {
    deletingAsset.value = false
  }
}

function apiMessage(reason: any, fallback: string) {
  return reason?.data?.message || reason?.message || fallback
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function mediaKind(asset: WebsiteEditorMediaAsset) {
  return asset.mime_type.startsWith('video/') ? 'Video' : 'Image'
}

function statusLabel(status: WebsiteEditorMediaAsset['status']) {
  return status === 'live' ? 'Live' : status === 'draft' ? 'Private' : 'Archived'
}

function statusClass(status: WebsiteEditorMediaAsset['status']) {
  if (status === 'live') return 'text-admin-success'
  if (status === 'draft') return 'text-admin-warning'
  return 'text-admin-muted'
}
</script>
